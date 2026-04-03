import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { TokenPayload } from '@/modules/auth/auth.types'
import { SigningKeyModel } from '@/modules/signing-key/signing-key.schema'
import { AppError } from './error.middleware'

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Unauthorized', 401)
  }

  const token = authHeader.slice(7)

  // Decode before (dont verify) to get kid from payload
  const decoded = jwt.decode(token) as TokenPayload | null
  if (!decoded?.kid) {
    throw new AppError('Unauthorized', 401)
  }

  // Get public key from DB with kid
  const signingKey = await SigningKeyModel.findOne({
    kid: decoded.kid,
    status: 'active',
  })

  if (!signingKey) {
    throw new AppError('Unauthorized', 401)
  }

  // Verify with public key - throws error if expired or invalid
  const payload = jwt.verify(token, signingKey.publicKey, {
    algorithms: ['RS256'],
    issuer: 'moji-api-app',
    audience: 'moji-api-client',
  }) as TokenPayload

  req.user = payload
  next()
}
