import type { Types } from 'mongoose'
import mongoose from 'mongoose'
import { AuthSessionModel } from './auth-session.schema'
import type { AuthSessionPayload } from './auth-session.types'
import type { RotateRefreshParams, RotateRefreshResult } from './auth.types'

export class AuthRepository {
  constructor(private readonly authSessionModel: typeof AuthSessionModel) {}

  async createSession(params: AuthSessionPayload) {
    return this.authSessionModel.create({
      ...params,
      ip: params?.ip,
      userAgent: params?.userAgent,
      rotatedFromSessionId: params?.rotatedFromSessionId,
      revokedAt: null,
    })
  }

  async findActiveSessionByHash(refreshTokenHash: string) {
    return this.authSessionModel.findOne({ refreshTokenHash, revokedAt: null }).exec()
  }

  async rotateRefreshSessionAtomic(params: RotateRefreshParams): Promise<RotateRefreshResult | null> {
    const mongoSession = await mongoose.startSession()

    try {
      mongoSession.startTransaction()

      const now = new Date()

      const oldSession = await this.authSessionModel.findOneAndUpdate(
        {
          refreshTokenHash: params.currentRefreshTokenHash,
          deviceId: params.deviceId,
          revokedAt: null,
          expiresAt: { $gt: now },
        },
        {
          $set: { revokedAt: now },
        },
        {
          new: false,
          session: mongoSession,
        },
      )

      if (!oldSession) {
        await mongoSession.abortTransaction()
        return null
      }

      const [newSession] = await this.authSessionModel.create(
        [
          {
            userId: oldSession.userId,
            keyId: oldSession.keyId,
            deviceId: oldSession.deviceId,
            refreshTokenHash: params.nextRefreshTokenHash,
            jti: params.nextJti,
            expiresAt: params.nextExpiresAt,
            ip: params?.ip,
            userAgent: params?.userAgent,
            rotatedFromSessionId: oldSession._id,
            revokedAt: null,
          },
        ],
        { session: mongoSession },
      )

      if (!newSession) {
        await mongoSession.abortTransaction()
        return null
      }

      await mongoSession.commitTransaction()

      return {
        oldSession: {
          _id: oldSession._id,
          userId: oldSession.userId,
          keyId: oldSession.keyId,
          deviceId: oldSession.deviceId,
        },
        newSession: {
          _id: newSession._id,
          userId: newSession.userId,
          keyId: newSession.keyId,
          deviceId: newSession.deviceId,
        },
      }
    } catch (error) {
      await mongoSession.abortTransaction()
      throw error
    } finally {
      await mongoSession.endSession()
    }
  }

  async revokeSession(sessionId: Types.ObjectId) {
    return this.authSessionModel
      .findByIdAndUpdate(sessionId, { revokedAt: new Date() }, { new: true })
      .exec()
  }

  async revokeSessionsByUserId(userId: Types.ObjectId) {
    return this.authSessionModel
      .updateMany({ userId, revokedAt: null }, { revokedAt: new Date() })
      .exec()
  }
}

export const authRepository = new AuthRepository(AuthSessionModel)
