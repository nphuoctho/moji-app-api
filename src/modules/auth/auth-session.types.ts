import type { Document, Types } from 'mongoose'

export interface AuthSessionDocument extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  keyId: Types.ObjectId
  deviceId: string
  refreshTokenHash: string
  jti: string
  expiresAt: Date
  revokedAt: Date | null
  rotatedFromSessionId: Types.ObjectId | null
  ip: string | null
  userAgent: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AuthSessionPayload {
  userId: Types.ObjectId
  keyId: Types.ObjectId
  deviceId: string
  refreshTokenHash: string
  jti: string
  expiresAt: Date
  ip?: string | null
  userAgent?: string | null
  rotatedFromSessionId?: Types.ObjectId | null
}
