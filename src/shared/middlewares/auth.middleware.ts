import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { AccessTokenClaims } from '@/modules/auth/auth.types'
import { SigningKeyModel } from '@/modules/signing-key/signing-key.schema'
import { AppError } from './error.middleware'

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401)
    }

    const token = authHeader.slice(7)

    const decoded = jwt.decode(token) as AccessTokenClaims | null
    if (!decoded?.kid) {
      throw new AppError('Unauthorized', 401)
    }

    const signingKey = await SigningKeyModel.findOne({
      kid: decoded.kid,
      status: 'active',
    })

    if (!signingKey) {
      throw new AppError('Unauthorized', 401)
    }

    const payload = jwt.verify(token, signingKey.publicKey, {
      algorithms: ['RS256'],
      issuer: 'moji-api-app',
      audience: 'moji-api-client',
    }) as AccessTokenClaims

    req.user = payload
    next()
  } catch (err) {
    next(err)
  }
}
