import type { NextFunction, Request } from 'express'

export type TypedRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams = Record<string, string>,
> = Request<TParams, unknown, TBody, TQuery>

export type TypedHandler<TBody = unknown, TQuery = unknown, TParams = Record<string, string>> = (
  req: TypedRequest<TBody, TQuery, TParams>,
  res: Response,
  next: NextFunction,
) => void | Promise<void>
