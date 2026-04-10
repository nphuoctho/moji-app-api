import type { Request } from 'express'
import type { ZodObject, z } from 'zod'
import type { AccessTokenClaims } from './auth.types'

/**
 * Represents a type-safe Express request object validated by a Zod schema.
 *
 * @template T - A ZodObject describing the expected request shape.
 *
 * The generic parameters are inferred as follows:
 * - `params`: Inferred from `T` if it has a `params` property, otherwise defaults to `Record<string, string>`.
 * - `body`: Inferred from `T` if it has a `body` property, otherwise defaults to `never`.
 * - `query`: Inferred from `T` if it has a `query` property, otherwise defaults to `Record<string, string>`.
 *
 * This type is useful for ensuring that Express route handlers receive requests
 * that conform to the validated structure defined by the Zod schema.
 */
export type ValidatedRequest<T extends ZodObject> = Request<
  z.infer<T> extends { params: infer P } ? P : Record<string, string>,
  unknown,
  z.infer<T> extends { body: infer B } ? B : never,
  z.infer<T> extends { query: infer Q } ? Q : Record<string, string>
>

export type AuthenticatedRequest<T extends ZodObject = ZodObject<z.ZodRawShape>> = Omit<
  ValidatedRequest<T>,
  'user'
> & {
  user: AccessTokenClaims
}
