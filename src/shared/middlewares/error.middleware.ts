import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { logger } from '../utils/logger.util'

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true,
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
  if (err instanceof ZodError) {
    logger.info({ err, path: req.path }, 'Validation error')
    const formattedErrors = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }))

    res.status(422).json({ success: false, message: 'Validation failed', errors: formattedErrors })
    return
  }

  if (err instanceof AppError && err.isOperational) {
    logger.info({ err, path: req.path }, 'Operational error')

    res.status(err.statusCode).json({ success: false, message: err.message })
    return
  }

  if (err instanceof Error) {
    logger.error({ err, path: req.path }, 'Unexpected error')

    res.status(400).json({ success: false, message: err.message })
    return
  }

  // Unexpected errors — don't leak internals
  logger.error({ err, path: req.path }, 'Unhandled error of unknown type')
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
  })
}
