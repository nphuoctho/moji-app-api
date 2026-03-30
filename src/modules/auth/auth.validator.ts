import z from 'zod'

export const SignUpSchema = z.object({
  body: z.object({
    email: z.email(),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, underscore only'),
    password: z
      .string()
      .min(8)
      .max(72)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character',
      ),
    firstName: z.string().min(3).max(30),
    lastName: z.string().min(3).max(30),
    deviceId: z.uuid('deviceId must be a valid UUID'),
  }),
})

export const signInSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
    deviceId: z.uuid(),
  }),
})

export const refreshSchema = z.object({
  body: z.object({
    deviceId: z.uuid(),
  }),
})

export type SignInDto = z.infer<typeof signInSchema>['body']
export type SignUpDto = z.infer<typeof SignUpSchema>['body']
export type RefreshDto = z.infer<typeof refreshSchema>['body']
