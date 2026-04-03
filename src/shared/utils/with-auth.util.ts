import type { NextFunction, RequestHandler, Response } from 'express'
import type { AuthenticatedRequest } from '../types/request.types'

export function withAuth(
  handler: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return handler as RequestHandler
}
