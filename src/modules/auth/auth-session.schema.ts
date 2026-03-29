import { model, Schema, Types } from 'mongoose'
import type { AuthSessionDocument } from './auth-session.types'

const authSessionSchema = new Schema<AuthSessionDocument>(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    keyId: {
      type: Types.ObjectId,
      required: true,
      ref: 'SigningKey',
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    jti: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
    rotatedFromSessionId: {
      type: Types.ObjectId,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    collection: 'auth_sessions',
    timestamps: true,
  },
)

authSessionSchema.index({ userId: 1, deviced: 1, revokedAt: 1 })
authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const AuthSessionModel = model<AuthSessionDocument>('AuthSession', authSessionSchema)
