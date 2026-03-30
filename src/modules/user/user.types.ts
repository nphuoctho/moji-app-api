import type { Document, Types } from 'mongoose'

export interface UserDocument extends Document {
  _id: Types.ObjectId
  email: string
  username: string
  passwordHash: string
  displayName: string
  avatarUrl: string
  avatarId: string
  bio: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserPayload {
  email: string
  username: string
  password: string
  displayName: string
}

export interface UpdateUserPayload {
  displayName?: string
  avatarUrl?: string
  avatarId?: string
  bio?: string
  phone?: string
}
