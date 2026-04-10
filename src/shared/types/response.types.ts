import type { StatusCodes } from 'http-status-codes'

type ResponseMeta = Record<string, unknown>
type ResponseLinks = Record<string, string>
type StatusCodeType = (typeof StatusCodes)[keyof typeof StatusCodes]

interface SendDataOptions {
  statusCode?: StatusCodeType
  meta?: ResponseMeta
  links?: ResponseLinks
}

interface SendErrorOptions<TDetail = Record<string, unknown>> {
  statusCode: StatusCodeType
  code: string
  message: string
  details?: TDetail[]
  meta?: ResponseMeta
}

export type { ResponseLinks, ResponseMeta, SendDataOptions, SendErrorOptions }
