import { model, Schema, Types } from 'mongoose'
import type { SigningKeyDocument } from './signing-key.types'

const signingKeySchema = new Schema<SigningKeyDocument>(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    kid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    privateKeyEncrypted: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'rotated', 'revoked'],
      default: 'active',
      index: true,
    },
  },
  {
    collection: 'signing_keys',
    timestamps: true,
  },
)

signingKeySchema.index({ userId: 1, status: 1, createdAt: -1 })

export const SigningKeyModel = model<SigningKeyDocument>('SigningKey', signingKeySchema)
