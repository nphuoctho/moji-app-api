import crypto from 'node:crypto'
import type { Types } from 'mongoose'
import { decryptText, encryptText } from '@/shared/utils/crypto.util'
import { logger } from '@/shared/utils/logger.util'
import { SigningKeyModel } from './signing-key.schema'

export class SigningKeyService {
  constructor(private readonly signingKeyModel: typeof SigningKeyModel) {}

  async createSigningKey(userId: Types.ObjectId) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        format: 'pem',
        type: 'spki',
      },
      privateKeyEncoding: {
        format: 'pem',
        type: 'pkcs8',
      },
    })

    const kid = crypto.randomUUID()

    const record = await this.signingKeyModel.create({
      userId,
      kid,
      publicKey,
      privateKeyEncrypted: encryptText(privateKey),
      status: 'active',
    })

    return record
  }

  async getActiveSigningKeyByUserId(userId: Types.ObjectId) {
    return this.signingKeyModel.findOne({ userId, status: 'active' }).sort({ createdAt: -1 }).exec()
  }

  async getSigningKeyById(keyId: Types.ObjectId) {
    return this.signingKeyModel.findById(keyId)
  }

  getPrivateKeyFromRecord(privateKeyEncrypted: string): string {
    return decryptText(privateKeyEncrypted)
  }

  async revokeSigningKey(keyId: Types.ObjectId) {
    const updated = await this.signingKeyModel
      .findByIdAndUpdate(
        keyId,
        {
          status: 'revoked',
        },
        { new: true },
      )
      .exec()

    if (!updated) {
      logger.warn({ keyId }, 'Signing key not found for revocation')
    }

    return updated
  }
}

export const signingKeyService = new SigningKeyService(SigningKeyModel)
