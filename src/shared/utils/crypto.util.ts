import crypto, { type CipherGCMTypes } from 'node:crypto'
import { env } from '@/config/env'

const ALGO: CipherGCMTypes = 'aes-256-gcm'
const IV_LENGTH: number = 12
const AUTH_TAG_LENGTH: number = 16
const PBKDF2_ITERATIONS: number = 100000
const PBKDF2_KEY_LENGTH: number = 64

function getMasterKey(): Buffer {
  const raw = env.JWT_PRIVATE_ENCRYPTION_KEY

  if (!raw) {
    throw new Error('JWT_PRIVATE_ENCRYPTION_KEY is not defined')
  }

  const key = Buffer.from(raw, 'base64')

  if (key.length !== 32) {
    throw new Error('JWT_PRIVATE_ENCRYPTION_KEY must be 32-byte base64')
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
  const tag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const encrypted = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

  const decipher = crypto.createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function getDummyHash(): string {
  return crypto
    .pbkdf2Sync(
      'timing-safe-dummy-password',
      'salt',
      PBKDF2_ITERATIONS,
      PBKDF2_KEY_LENGTH,
      'sha256',
    )
    .toString('hex')
}
