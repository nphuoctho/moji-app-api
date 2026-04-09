import z from 'zod'

export const AuthResponseDto = z
  .object({
    accessToken: z.string().meta({
      description: 'JWT access token',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
  })
  .meta({
    id: 'AuthResponseDto',
    description: 'Authentication response with access token',
  })

export type AuthResponseDtoOutput = z.output<typeof AuthResponseDto>

export const ApiResponseDto = z
  .object({
    success: z.boolean().meta({
      description: 'Indicates if the request was successful',
      example: true,
    }),
  })
  .meta({
    id: 'ApiResponseDto',
    description: 'Generic API response',
  })

export type ApiResponseDtoOutput = z.output<typeof ApiResponseDto>

export const ErrorDto = z
  .object({
    success: z.boolean().meta({
      description: 'Indicates if the request failed',
      example: false,
    }),
    message: z.string().meta({
      description: 'Error message',
      example: 'Error message',
    }),
  })
  .meta({
    id: 'ErrorDto',
    description: 'Error response',
  })

export type ErrorDtoOutput = z.output<typeof ErrorDto>
