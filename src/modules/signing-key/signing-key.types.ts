import type { Document, Types } from 'mongoose'

export type SigningKeyStatus = 'active' | 'rotated' | 'revoked'

export interface SigningKeyDocument extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  kid: string
  publicKey: string
  privateKeyEncrypted: string
  status: SigningKeyStatus
  createdAt: Date
  updatedAt: Date
}
