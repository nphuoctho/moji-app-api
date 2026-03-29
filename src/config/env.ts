import 'dotenv/config'
import z from 'zod'

// A basic regex for a MongoDB connection URI.
// This regex ensures it starts with 'mongodb://' or 'mongodb+srv://'
// and has at least one host part.
const mongoUriRegex = /^mongodb(\+srv)?:\/\/(?:[^@]+@)?[^/?]+(?:\/[^?#]*)?(?:\?[^#]*)?$/

const mongoUriSchema = z
  .string()
  .refine((uri) => mongoUriRegex.test(uri), "URI must start with 'mongodb://' or 'mongodb+srv://'")

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: mongoUriSchema,
  JWT_ACCESS_EXPIRES_IN: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60), // 15 minutes
  JWT_REFRESH_EXPIRES_IN: z.coerce
    .number()
    .int()
    .positive()
    .default(7 * 24 * 60 * 60), // 7 days
  JWT_PRIVATE_KEY_ENCRYPTION_KEY: z.string().min(1),
})

const envParsed = envSchema.safeParse(process.env)

if (!envParsed.success) {
  console.error('Invalid environment variables:', z.treeifyError(envParsed.error).properties)
  process.exit(1)
}

export const env = envParsed.data
