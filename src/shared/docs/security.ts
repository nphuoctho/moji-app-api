export const securitySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT access token in Authorization: Bearer <token>',
  },
  refreshCookieAuth: {
    type: 'apiKey',
    in: 'cookie',
    name: 'refresh_token',
    description: 'Refresh token stored in cookie',
  },
} as const
