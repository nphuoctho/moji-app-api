import type { Router } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { env } from '@/config/env'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Moji API',
      version: '1.0.0',
      description: 'RESTful API for Moji application',
    },
    servers: [
      {
        url:
          env.NODE_ENV === 'production'
            ? 'moji-api.up.railway.app'
            : `http://localhost:${env.PORT}`,
        description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Validation errors in your request',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Oops! The value is invalid',
                  },
                  code: {
                    type: 'integer',
                    example: 34,
                  },
                  field: {
                    type: 'string',
                    example: 'email',
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
}

const swaggerSpec = swaggerJsdoc(options)

export function setupSwagger(router: Router): void {
  router.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Moji API Documentation',
    }),
  )

  router.get('/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })
}
