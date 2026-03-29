import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { Types } from 'mongoose'
import { env } from '@/config/env'
import { hashToken } from '../../shared/utils/crypto.utils'
import { type SigningKeyService, signingKeyService } from '../signing-key/signing-key.service'
import type { SigningKeyDocument } from '../signing-key/signing-key.types'
import { type UserRepository, userRepository } from '../user/user.repository'
import type { UserDocument } from '../user/user.types'
import { type AuthRepository, authRepository } from './auth.repository'
import type { SignInDto, TokenPayload } from './auth.types'

export class AuthService {
  private readonly ACCESS_ALG = 'RS256'
  private readonly ACCESS_EXPIRES_IN_SECONDS = env.JWT_ACCESS_EXPIRES_IN
  private readonly REFRESH_EXPIRES_IN_SECONDS = env.JWT_REFRESH_EXPIRES_IN

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly signingKeyService: SigningKeyService,
  ) {}

  private signAccessToken(payload: TokenPayload, privateKey: string): string {
    return jwt.sign(payload, privateKey, {
      algorithm: this.ACCESS_ALG,
      expiresIn: this.ACCESS_EXPIRES_IN_SECONDS,
      issuer: 'moji-api-app',
      audience: 'moji-api-client',
    })
  }

  private async validateCredentials(email: string, password: string) {
    const user = await this.userRepository.findUserByEmail(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      throw new Error('Invalid credentials')
    }

    return user
  }

  private async getOrCreateSigningKey(userId: Types.ObjectId) {
    let key = await this.signingKeyService.getActiveSigningKeyByUserId(userId)
    if (!key) {
      key = await this.signingKeyService.createSigningKey(userId)
    }

    return key
  }

  private async createSession(
    userId: Types.ObjectId,
    keyId: Types.ObjectId,
    deviceId: string,
    meta: { ip?: string; userAgent?: string },
    rotatedFromSessionId?: Types.ObjectId,
  ) {
    const jti = crypto.randomUUID()

    const refreshToken = crypto.randomBytes(48).toString('base64url')
    const refreshTokenHash = hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + this.REFRESH_EXPIRES_IN_SECONDS * 1000)

    const session = await this.authRepository.createSession({
      userId,
      keyId,
      deviceId,
      refreshTokenHash,
      jti,
      expiresAt,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
      rotatedFromSessionId,
    })

    return { session, refreshToken }
  }

  private buildAccessTokenPayload(
    userId: Types.ObjectId,
    sessionId: Types.ObjectId,
    kid: string,
    email: string,
    username: string,
  ): TokenPayload {
    return {
      sub: String(userId),
      sid: String(sessionId),
      kid,
      email,
      username,
    }
  }

  private async validateRefreshSession(refreshToken: string, deviceId: string) {
    const hashed = hashToken(refreshToken)
    const session = await this.authRepository.findActiveSesssionByHash(hashed)

    if (!session || session.deviceId !== deviceId) {
      throw new Error('Invalid refresh token')
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.authRepository.revokedSession(session._id)
      throw new Error('Refresh token expired')
    }

    return session
  }

  private generateAccessToken(
    user: UserDocument,
    sessionId: Types.ObjectId,
    key: SigningKeyDocument,
  ) {
    const privateKey = this.signingKeyService.getPrivateKeyFromRecord(key.privateKeyEncrypted)

    const payload = this.buildAccessTokenPayload(
      user._id,
      sessionId,
      key.kid,
      user.email,
      user.username,
    )

    return this.signAccessToken(payload, privateKey)
  }

  async signIn(signInDto: SignInDto, meta: { ip?: string; userAgent?: string }) {
    const user = await this.validateCredentials(signInDto.email, signInDto.password)

    const key = await this.getOrCreateSigningKey(user._id)

    const { session, refreshToken } = await this.createSession(
      user._id,
      key._id,
      signInDto.deviceId,
      meta,
    )

    const accessToken = this.generateAccessToken(user, session._id, key)

    return { accessToken, refreshToken }
  }

  async refresh(refreshToken: string, deviceId: string, meta: { ip?: string; userAgent?: string }) {
    const session = await this.validateRefreshSession(refreshToken, deviceId)
    const user = await this.userRepository.findUserById(session.userId)

    if (!user) {
      throw new Error('User not found')
    }

    const key = await this.signingKeyService.getSigningKeyById(session.keyId)
    if (!key) {
      throw new Error('Signing key not found')
    }

    const newRefreshToken = crypto.randomBytes(48).toString('base64url')
    const newRefreshTokenHash = hashToken(newRefreshToken)
    const newExpiresAt = new Date(Date.now() + this.REFRESH_EXPIRES_IN_SECONDS * 1000)

    const newSession = await this.authRepository.rotateRefreshSession(session._id, {
      userId: session.userId,
      keyId: session.keyId,
      deviceId,
      refreshTokenHash: newRefreshTokenHash,
      jti: crypto.randomUUID(),
      expiresAt: newExpiresAt,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
      rotatedFromSessionId: session._id,
    })

    const accessToken = this.generateAccessToken(user, newSession._id, key)

    return { accessToken, refreshToken: newRefreshToken }
  }

  async signOutCurrentSession(sessionId: string) {
    return this.authRepository.revokedSession(sessionId as never)
  }

  async signOutAllSession(userId: string) {
    return this.authRepository.revokeSessionsByUserId(userId as never)
  }
}

export const authService = new AuthService(authRepository, userRepository, signingKeyService)
