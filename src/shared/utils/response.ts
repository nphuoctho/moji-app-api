import type { Response } from 'express'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  meta?: Record<string, unknown>
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  statusCode: number = 200,
  meta?: Record<string, unknown>,
) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  }

  res.status(statusCode).json(response)
}

export function sendError(res: Response, message: string, statusCode: number = 400): void {
  res.status(statusCode).json({
    success: false,
    message,
  })
}
