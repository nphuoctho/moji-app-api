import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type z from 'zod'
import type { TypedHandler } from '../types/express.type'

export function createHandler<TSchema extends z.ZodSchema<unknown>>(
  schema: TSchema,
  handler: TypedHandler<
    z.infer<TSchema> extends { body?: infer B } ? B : unknown,
    z.infer<TSchema> extends { query?: infer Q } ? Q : unknown,
    z.infer<TSchema> extends { params?: infer P } ? P : unknown
  >,
): RequestHandler

export function createHandler(handler: RequestHandler): RequestHandler

export function createHandler(
  schemaOrHandler: z.ZodSchema<unknown> | RequestHandler,
  handler?: RequestHandler,
): RequestHandler {
  const schema = handler ? (schemaOrHandler as z.ZodSchema<unknown>) : null
  const fn = handler ?? (schemaOrHandler as RequestHandler)

  return (req: Request, res: Response, next: NextFunction) => {
    if (schema) {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors })
      }
      req.body = result.data.body ?? req.body
      req.query = result.data.query ?? req.query
      req.params = result.data.params ?? req.params
    }
    return fn(req, res, next)
  }
}
