import type { Types } from 'mongoose'
import mongoose from 'mongoose'
import { AuthSessionModel } from './auth-session.schema'
import type { AuthSessionPayload } from './auth-session.types'

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

  async findActiveSesssionByHash(refreshTokenHash: string) {
    return this.authSessionModel.findOne({ refreshTokenHash, revokedAt: null }).exec()
  }

  async rotateRefreshSession(oldSessionId: Types.ObjectId, payload: AuthSessionPayload) {
    const mongoSession = await mongoose.startSession()

    try {
      mongoSession.startTransaction()

      await this.authSessionModel.findByIdAndUpdate(
        oldSessionId,
        { status: 'revoked' },
        { session: mongoSession },
      )

      const [newSession] = await this.authSessionModel.create([payload], { session: mongoSession })

      await mongoSession.commitTransaction()

      return newSession
    } catch (error) {
      await mongoSession.abortTransaction()
      throw error
    } finally {
      await mongoSession.endSession()
    }
  }

  async revokedSession(sessionId: Types.ObjectId) {
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
