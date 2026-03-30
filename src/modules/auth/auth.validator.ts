import z from 'zod'

export const signUpDto = z.object({
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
    firstname: z.string().min(3).max(30),
    lastname: z.string().min(3).max(30),
    deviceId: z.uuid('deviceId must be a valid UUID'),
  }),
})

export const signInDto = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
    deviceId: z.uuid(),
  }),
})

export const refreshDto = z.object({
  body: z.object({
    deviceId: z.uuid(),
  }),
})
