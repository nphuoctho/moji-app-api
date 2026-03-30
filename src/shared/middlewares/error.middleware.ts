import type { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger.util'

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    logger.warn({ err, path: req.path, statusCode: err.statusCode }, 'Operational error')
    res.status(err.statusCode).json({ success: false, message: err.message })
    return
  }

  if (err instanceof Error) {
    logger.error({ err, path: req.path }, 'Unexpected error')
    res.status(500).json({ success: false, message: 'Internal server error' })
    return
  }

  // Unexpected errors — don't leak internals
  logger.error({ err, path: req.path }, 'Unhandled error of unknown type')
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.',
  })
}
