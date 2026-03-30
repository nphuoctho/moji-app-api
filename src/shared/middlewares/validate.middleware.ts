import type { NextFunction, Request, Response } from 'express'
import type { ZodError, ZodObject } from 'zod'
import type { ValidationErrorItem, ValidationErrorResponse } from '../types/validator.types'

function formatZodError(error: ZodError): ValidationErrorItem[] {
  const fieldMap = new Map<string, string[]>()

  for (const issue of error.issues) {
    const field = issue.path.join('.') || 'root'
    const existing = fieldMap.get(field)
    if (existing) {
      existing.push(issue.message)
    } else {
      fieldMap.set(field, [issue.message])
    }
  }

  return Array.from(fieldMap.entries()).map(([field, messages]) => ({ field, messages }))
}

function ensureObject<T>(value: T | null | undefined): T {
  return (value ?? {}) as T
}

export function validate(schema: ZodObject) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationErrorItem[] = []

    const keys = ['body', 'params', 'query'] as const

    for (const key of keys) {
      const subSchema = schema.shape[key]
      if (!subSchema) continue

      const result = subSchema.safeParse(req[key])

      if (!result.success) {
        errors.push(...formatZodError(result.error))
        continue
      }

      if (key === 'body') {
        req.body = result.data
      } else if (key === 'params') {
        req.params = ensureObject<typeof req.params>(result.data)
      } else if (key === 'query') {
        req.query = ensureObject<typeof req.query>(result.data)
      }
    }

    if (errors.length > 0) {
      const response: ValidationErrorResponse = {
        success: false,
        statusCode: 422,
        message: 'Validation failed',
        errors,
      }

      res.status(422).json(response)
      return
    }

    next()
  }
}
