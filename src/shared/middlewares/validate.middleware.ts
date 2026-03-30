import type { ZodError, ZodType } from 'zod'

function formatZodError(error: ZodError) {
  const result: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root'
    if (!result[path]) result[path] = []
    result[path].push(issue.message)
  }
  return result
}

export class ValidationError extends Error {
  errors: Record<string, string[]>
  constructor(errors: Record<string, string[]>) {
    super('Validation failed')
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export function validateDto<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new ValidationError(formatZodError(result.error))
  }
  return result.data
}
