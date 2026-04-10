import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AppError } from './error.middleware'

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const message = `Cannot ${req.method} ${req.originalUrl}`
  const error = new AppError(message, StatusCodes.NOT_FOUND)
  next(error)
}
