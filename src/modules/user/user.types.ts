import type { Document, Types } from 'mongoose'

export interface UserEntity {
  _id: Types.ObjectId
  email: string
  username: string
  passwordHash: string
  displayName: string
  avatarUrl: string | null
  avatarPublicId: string | null
  bio: string | null
  phoneNumber: string | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface UserDocument extends Document, UserEntity {}

export interface CreateUserRecord {
  email: string
  username: string
  passwordHash: string
  displayName: string
}

export interface UpdateUserRecord {
  displayName?: string
  avatarUrl?: string
  avatarPublicId?: string
  bio?: string
  phoneNumber?: string
}
