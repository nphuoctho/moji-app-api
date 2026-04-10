import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { ZodError, ZodObject } from 'zod'
import type { FieldError } from '../types/validator.types'
import { sendError } from '../utils/response.util'

const VALIDATION_KEYS = ['body', 'params', 'query'] as const
type ValidationKey = (typeof VALIDATION_KEYS)[number]

function formatZodError(error: ZodError): FieldError[] {
  return error.issues.map(({ path, message }) => ({
    field: path.join('.') || 'root',
    message,
  }))
}

function ensureObject<T>(value: unknown): T {
  return (typeof value === 'object' && value !== null ? value : {}) as T
}

export function validate(schema: ZodObject) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: FieldError[] = []

    for (const key of VALIDATION_KEYS) {
      const subSchema = schema.shape[key]
      if (!subSchema) continue

      const parseResult = subSchema.safeParse(req[key as ValidationKey])

      if (!parseResult.success) {
        validationErrors.push(...formatZodError(parseResult.error))
        continue
      }

      req[key as ValidationKey] = ensureObject(parseResult.data)
    }

    if (validationErrors.length > 0) {
      sendError<FieldError>(res, {
        statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid data',
        details: validationErrors,
      })
      return
    }

    next()
  }
}
