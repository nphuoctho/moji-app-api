import z from 'zod'
import type { ZodOpenApiRequestBodyObject } from 'zod-openapi'

export const SignInDto = z
  .object({
    email: z.email().meta({
      description: 'User email address',
      example: 'user@example.com',
    }),
    password: z.string().min(1).meta({
      description: 'User password',
    }),
    deviceId: z.uuid().meta({
      description: 'Device UUID',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
  })
  .meta({
    id: 'SignInDto',
    description: 'User sign-in request body',
  })

export type SignInDtoInput = z.input<typeof SignInDto>
export type SignInDtoOutput = z.output<typeof SignInDto>

export const signInRequestBody: ZodOpenApiRequestBodyObject = {
  content: {
    'application/json': {
      schema: SignInDto,
    },
  },
}
