import z from 'zod'

export const MetaDto = z
  .object({
    requestId: z.string().optional(),
  })
  .catchall(z.unknown())
  .meta({ id: 'MetaDto' })

export const LinksDto = z.record(z.string(), z.string()).meta({ id: 'LinksDto' })

export const FieldErrorDto = z
  .object({
    field: z.string().meta({ example: 'body.email' }),
    message: z.string().meta({ example: 'Invalid email format' }),
  })
  .meta({ id: 'FieldErrorDto' })

export const ErrorObjectDto = z
  .object({
    code: z.string().meta({ example: 'UNAUTHORIZED' }),
    message: z.string().meta({ example: 'Unauthorized' }),
    details: z.array(z.unknown()).optional(),
  })
  .meta({ id: 'ErrorObjectDto' })

export const ErrorEnvelopeDto = z
  .object({
    error: ErrorObjectDto,
    meta: MetaDto.optional(),
  })
  .meta({ id: 'ErrorEnvelopeDto' })

export const ValidationErrorObjectDto = z
  .object({
    code: z.literal('VALIDATION_ERROR'),
    message: z.string().meta({ example: 'The request contains invalid data' }),
    details: z.array(FieldErrorDto),
  })
  .meta({ id: 'ValidationErrorObjectDto' })

export const ValidationErrorEnvelopeDto = z
  .object({
    error: ValidationErrorObjectDto,
    meta: MetaDto.optional(),
  })
  .meta({ id: 'ValidationErrorEnvelopeDto' })

export const buildDataEnvelopeDto = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: MetaDto.optional(),
    links: LinksDto.optional(),
  })

export const unauthorizedResponse = {
  description: 'Unauthorized',
  content: {
    'application/json': {
      schema: ErrorEnvelopeDto,
    },
  },
}

export const validation422Response = {
  description: 'Validation failed',
  content: {
    'application/json': {
      schema: ValidationErrorEnvelopeDto,
    },
  },
}
