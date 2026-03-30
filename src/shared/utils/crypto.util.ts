import crypto from 'node:crypto'
import { env } from '@/config/env'

const ALGO = 'aes-256-gcm'
const IV_LENGTH = 12

function getMasterKey(): Buffer {
  const raw = env.JWT_PRIVATE_KEY_ENCRYPTION_KEY ?? ''
  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) {
    throw new Error('JWT_PRIVATE_KEY_ENCRYPTION_KEY must be 32-byte base64')
  }

  return key
}

export function encryptText(plainText: string): string {
  const key = getMasterKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decryptText(payload: string): string {
  const key = getMasterKey()
  const raw = Buffer.from(payload, 'base64')
  const iv = raw.subarray(0, IV_LENGTH)
  const tag = raw.subarray(IV_LENGTH, IV_LENGTH + 16)
  const encrypted = raw.subarray(IV_LENGTH + 16)

  const decipher = crypto.createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  const plain = Buffer.concat([decipher.update(encrypted), decipher.final()])

  return plain.toString('utf8')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
