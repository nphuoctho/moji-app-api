import z from 'zod'
import type { ZodOpenApiRequestBodyObject } from 'zod-openapi'

export const SignUpDto = z
  .object({
    email: z.email().meta({
      description: 'User email address',
      example: 'user@example.com',
    }),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, underscore only')
      .meta({
        description: 'Unique username',
        example: 'john_doe',
      }),
    password: z
      .string()
      .min(8)
      .max(72)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character',
      )
      .meta({
        description: 'Password (min 8 chars, uppercase, lowercase, number, special char)',
        example: 'SecureP@ss1',
      }),
    firstName: z.string().min(3).max(30).meta({
      description: 'User first name',
      example: 'John',
    }),
    lastName: z.string().min(3).max(30).meta({
      description: 'User last name',
      example: 'Doe',
    }),
    deviceId: z.uuid().meta({
      description: 'Device UUID',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
  })
  .meta({
    id: 'SignUpDto',
    description: 'User registration request body',
  })

export type SignUpDtoInput = z.input<typeof SignUpDto>
export type SignUpDtoOutput = z.output<typeof SignUpDto>

export const signUpRequestBody: ZodOpenApiRequestBodyObject = {
  content: {
    'application/json': {
      schema: SignUpDto,
    },
  },
}
