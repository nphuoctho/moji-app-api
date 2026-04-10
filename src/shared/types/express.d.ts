import type { AccessTokenClaims } from './auth.types'

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenClaims
    }
  }
}
