import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AppError } from '../middlewares/error.middleware'
import type { AuthenticatedRequest } from '../types/request.types'

type AuthHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => Promise<void> | void

function assertAuthenticated(req: Request): asserts req is AuthenticatedRequest {
  if (!req.user) {
    throw new AppError('Missing authenticated user in request context', StatusCodes.UNAUTHORIZED)
  }
}

export function withAuth(handler: AuthHandler): RequestHandler {
  return async (req, res, next) => {
    try {
      assertAuthenticated(req)
      await handler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
