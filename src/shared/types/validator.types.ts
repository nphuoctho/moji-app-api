export interface ValidationErrorItem {
  field: string
  messages: string[]
}

export interface ValidationErrorResponse {
  success: false
  statusCode: number
  message: string
  errors: ValidationErrorItem[]
}
