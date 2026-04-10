import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt, { type Algorithm, type VerifyOptions } from 'jsonwebtoken'
import type { AccessTokenClaims } from '@/modules/auth/auth.types'
import { SigningKeyModel } from '@/modules/signing-key/signing-key.schema'
import { AppError } from './error.middleware'

const BEARER_PREFIX = 'Bearer '
const TOKEN_ALGORITHM: Algorithm = 'RS256'
const JWT_CONFIG: VerifyOptions = {
  algorithms: [TOKEN_ALGORITHM],
  issuer: 'moji-api-app',
  audience: 'moji-api-client',
}

function extractToken(authHeader?: string): string {
  if (!authHeader?.startsWith(BEARER_PREFIX)) {
    throw new AppError('Missing or invalid authorization header', StatusCodes.UNAUTHORIZED)
  }
  return authHeader.slice(BEARER_PREFIX.length)
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req.headers.authorization)
    const decoded = jwt.decode(token) as AccessTokenClaims | null

    if (!decoded?.kid) {
      throw new AppError('Invalid token: missing key ID', StatusCodes.UNAUTHORIZED)
    }

    const signingKey = await SigningKeyModel.findOne({
      kid: decoded.kid,
      status: 'active',
    })

    if (!signingKey) {
      throw new AppError('Signing key not found or inactive', StatusCodes.UNAUTHORIZED)
    }

    const payload = jwt.verify(token, signingKey.publicKey, JWT_CONFIG) as AccessTokenClaims
    req.user = payload
    next()
  } catch (err) {
    next(err)
  }
}
