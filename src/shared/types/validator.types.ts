export interface FieldError {
  field: string
  message: string
}

export interface ValidationErrorResponse {
  error: {
    code: 'VALIDATION_ERROR'
    message: string
    details: FieldError[]
  }
  meta?: {
    requestId?: string
  }
}
