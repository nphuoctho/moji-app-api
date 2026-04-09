import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
import { env } from '@/config/env'
import { AppError } from '@/shared/middlewares/error.middleware'
import { hashToken } from '../../shared/utils/crypto.util'
import { type SigningKeyService, signingKeyService } from '../signing-key/signing-key.service'
import type { SigningKeyDocument } from '../signing-key/signing-key.types'
import { type UserRepository, userRepository } from '../user/user.repository'
import type { UserEntity } from '../user/user.types'
import { type AuthRepository, authRepository } from './auth.repository'
import type { AccessTokenClaims } from './auth.types'
import type { SignInDtoOutput } from './dto/sign-in.dto'
import type { SignUpDtoOutput } from './dto/sign-up.dto'

export class AuthService {
  private readonly ACCESS_ALG = 'RS256'
  private readonly ACCESS_EXPIRES_IN_SECONDS = env.JWT_ACCESS_EXPIRES_IN
  private readonly REFRESH_EXPIRES_IN_SECONDS = env.JWT_REFRESH_EXPIRES_IN

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly signingKeyService: SigningKeyService,
  ) {}

  private signAccessToken(payload: AccessTokenClaims, privateKey: string): string {
    return jwt.sign(payload, privateKey, {
      algorithm: this.ACCESS_ALG,
      expiresIn: this.ACCESS_EXPIRES_IN_SECONDS,
      issuer: 'moji-api-app',
      audience: 'moji-api-client',
    })
  }

  private async validateCredentials(email: string, password: string) {
    const user = await this.userRepository.findUserByEmail(email)

    const dummyHash = '$2b$12$invalidhashfortimingprotection000000000000000000000'
    const ok = await bcrypt.compare(password, user?.passwordHash ?? dummyHash)

    if (!user || !ok) {
      throw new AppError('Invalid credentials', 401)
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

  private buildAccessTokenClaims(
    userId: Types.ObjectId,
    sessionId: Types.ObjectId,
    kid: string,
  ): AccessTokenClaims {
    return {
      sub: String(userId),
      sid: String(sessionId),
      kid,
    }
  }

  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid ObjectId', 400)
    }

    return new Types.ObjectId(id)
  }

  private generateAccessToken(
    user: UserEntity,
    sessionId: Types.ObjectId,
    key: SigningKeyDocument,
  ) {
    const privateKey = this.signingKeyService.getPrivateKeyFromRecord(key.privateKeyEncrypted)

    const payload = this.buildAccessTokenClaims(user._id, sessionId, key.kid)

    return this.signAccessToken(payload, privateKey)
  }

  async signIn(signInPayload: SignInDtoOutput, meta: { ip?: string; userAgent?: string }) {
    const user = await this.validateCredentials(signInPayload.email, signInPayload.password)

    const key = await this.getOrCreateSigningKey(user._id)

    const { session, refreshToken } = await this.createSession(
      user._id,
      key._id,
      signInPayload.deviceId,
      meta,
    )

    const accessToken = this.generateAccessToken(user, session._id, key)

    return { accessToken, refreshToken }
  }

  async signUp(
    signUpPayload: Omit<SignUpDtoOutput, 'deviceId'>,
    meta: { ip?: string; userAgent?: string; deviceId: string },
  ) {
    const [emailTaken, usernameTaken] = await Promise.all([
      this.userRepository.existsUserByEmail(signUpPayload.email),
      this.userRepository.existsUserByUsername(signUpPayload.username),
    ])

    if (emailTaken) throw new AppError('Email already in use', 409)
    if (usernameTaken) throw new AppError('Username already taken', 409)

    const passwordHash = await bcrypt.hash(signUpPayload.password, 12)

    const user = await this.userRepository.createUser({
      email: signUpPayload.email,
      username: signUpPayload.username,
      passwordHash,
      displayName: `${signUpPayload.firstName} ${signUpPayload.lastName}`,
    })

    const key = await this.signingKeyService.createSigningKey(user._id)

    const { session, refreshToken } = await this.createSession(user._id, key._id, meta.deviceId, {
      ip: meta.ip,
      userAgent: meta.userAgent,
    })

    const accessToken = this.generateAccessToken(user, session._id, key)

    return { accessToken, refreshToken }
  }

  async refresh(refreshToken: string, deviceId: string, meta: { ip?: string; userAgent?: string }) {
    const currentRefreshTokenHash = hashToken(refreshToken)

    const newRefreshToken = crypto.randomBytes(48).toString('base64url')
    const nextRefreshTokenHash = hashToken(newRefreshToken)
    const nextExpiresAt = new Date(Date.now() + this.REFRESH_EXPIRES_IN_SECONDS * 1000)
    const nextJti = crypto.randomUUID()

    const rotatedSession = await this.authRepository.rotateRefreshSessionAtomic({
      currentRefreshTokenHash,
      deviceId,
      nextRefreshTokenHash,
      nextJti,
      nextExpiresAt,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
    })

    if (!rotatedSession) {
      throw new AppError('Create new session faild', 401)
    }

    const user = await this.userRepository.findUserById(rotatedSession.oldSession.userId)
    if (!user) {
      await this.authRepository.revokeSession(rotatedSession.newSession._id)
      throw new AppError('User not found', 401)
    }

    const key = await this.signingKeyService.getSigningKeyById(rotatedSession.oldSession.keyId)
    if (!key) {
      await this.authRepository.revokeSession(rotatedSession.newSession._id)
      throw new AppError('Signing key not found', 401)
    }

    const accessToken = this.generateAccessToken(user, rotatedSession.newSession._id, key)

    return { accessToken, refreshToken: newRefreshToken }
  }

  async signOutCurrentSession(sessionId: string) {
    return this.authRepository.revokeSession(this.toObjectId(sessionId))
  }

  async signOutAllSession(userId: string) {
    return this.authRepository.revokeSessionsByUserId(this.toObjectId(userId))
  }
}

export const authService = new AuthService(authRepository, userRepository, signingKeyService)
