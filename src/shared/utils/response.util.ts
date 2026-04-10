import type { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type {
  ResponseLinks,
  ResponseMeta,
  SendDataOptions,
  SendErrorOptions,
} from '../types/response.types'

const buildMeta = (res: Response, meta?: ResponseMeta): ResponseMeta | undefined => {
  const requestId = res.locals?.requestId as string | undefined
  const merged = {
    ...(requestId ? { requestId } : {}),
    ...(meta ?? {}),
  }
  return Object.keys(merged).length > 0 ? merged : undefined
}

const buildResponseJson = <T extends Record<string, unknown>>(
  base: T,
  meta?: ResponseMeta,
  links?: ResponseLinks,
) => ({
  ...base,
  ...(meta && { meta }),
  ...(links && { links }),
})

export const sendData = <T>(res: Response, data: T, options: SendDataOptions = {}): void => {
  res
    .status(options.statusCode ?? StatusCodes.OK)
    .json(buildResponseJson({ data }, buildMeta(res, options.meta), options.links))
}

export const sendCreated = <T>(res: Response, data: T, meta?: ResponseMeta): void => {
  sendData(res, data, { statusCode: StatusCodes.CREATED, meta })
}

export const sendNoContent = (res: Response): void => {
  res.status(StatusCodes.NO_CONTENT).send()
}

export const sendError = <TDetail = Record<string, unknown>>(
  res: Response,
  options: SendErrorOptions<TDetail>,
): void => {
  const error = {
    code: options.code,
    message: options.message,
    ...(options.details && options.details.length > 0 && { details: options.details }),
  }

  res.status(options.statusCode).json(buildResponseJson({ error }, buildMeta(res, options.meta)))
}
