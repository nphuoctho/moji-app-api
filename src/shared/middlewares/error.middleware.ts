import type { NextFunction, Request, Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import type { FieldError } from '../types/validator.types'
import { logger } from '../utils/logger.util'
import { sendError } from '../utils/response.util'

type ErrorDetails = FieldError | Record<string, unknown>

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    public readonly details?: ErrorDetails[],
  ) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }
}

const ERROR_CODE_MAP: Record<number, string> = {
  [StatusCodes.BAD_REQUEST]: 'BAD_REQUEST',
  [StatusCodes.UNAUTHORIZED]: 'UNAUTHORIZED',
  [StatusCodes.FORBIDDEN]: 'FORBIDDEN',
  [StatusCodes.NOT_FOUND]: 'NOT_FOUND',
  [StatusCodes.CONFLICT]: 'CONFLICT',
  [StatusCodes.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
  [StatusCodes.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
}

function getErrorCode(statusCode: number): string {
  return ERROR_CODE_MAP[statusCode] ?? 'INTERNAL_SERVER_ERROR'
}

export function errorMiddleware(
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    logger.warn({ error, path: request.path, statusCode: error.statusCode }, 'Operational error')
    sendError(response, {
      statusCode: error.statusCode,
      code: getErrorCode(error.statusCode),
      message: error.message,
      details: error.details,
    })
    return
  }

  logger.error({ error, path: request.path }, 'Unexpected error')
  sendError(response, {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_SERVER_ERROR',
    message: ReasonPhrases.INTERNAL_SERVER_ERROR,
  })
}
