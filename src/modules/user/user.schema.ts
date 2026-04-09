import { model, Schema } from 'mongoose'
import type { UserDocument } from './user.types'

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9_]+$/,
      minlength: 3,
      maxlength: 64,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    avatarUrl: String,
    avatarPublicId: String,
    bio: {
      type: String,
      maxlength: 500,
    },
    phoneNumber: {
      type: String,
      sparse: true,
    },
    deletedAt: {
      type: Date,
      index: true,
      default: null,
    },
  },
  {
    collection: 'users',
    timestamps: true,
  },
)

export const UserModel = model<UserDocument>('User', userSchema)
