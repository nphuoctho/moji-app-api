import type { Types } from 'mongoose'

export interface AccessTokenClaims {
  sub: string
  sid: string
  kid: string
}

export interface RotateRefreshParams {
  currentRefreshTokenHash: string
  deviceId: string
  nextRefreshTokenHash: string
  nextJti: string
  nextExpiresAt: Date
  ip?: string
  userAgent?: string
}

export interface RotateRefreshResult {
  oldSession: {
    _id: Types.ObjectId
    userId: Types.ObjectId
    keyId: Types.ObjectId
    deviceId: string
  }
  newSession: {
    _id: Types.ObjectId
    userId: Types.ObjectId
    keyId: Types.ObjectId
    deviceId: string
  }
}
