import type { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import z from 'zod'
import { createDocument } from 'zod-openapi'
import { env } from '@/config/env'

const authPaths = {
  '/auth/sign-up': {
    post: {
      tags: ['Auth'],
      summary: 'Register new user',
      requestBody: {
        content: {
          'application/json': {
            schema: z.object({
              email: z
                .string()
                .email()
                .meta({ description: 'User email', example: 'user@example.com' }),
              username: z
                .string()
                .min(3)
                .max(30)
                .meta({ description: 'Unique username', example: 'john_doe' }),
              password: z.string().min(8).meta({ description: 'Password', example: 'SecureP@ss1' }),
              firstName: z.string().min(3).meta({ description: 'First name', example: 'John' }),
              lastName: z.string().min(3).meta({ description: 'Last name', example: 'Doe' }),
              deviceId: z.uuid().meta({
                description: 'Device UUID',
                example: '550e8400-e29b-41d4-a716-446655440000',
              }),
            }),
          },
        },
      },
      responses: {
        '201': {
          description: 'Registration successful',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().meta({ example: true }),
                data: z
                  .object({
                    accessToken: z.string().meta({ description: 'JWT access token' }),
                  })
                  .meta({ id: 'AuthDataResponse' }),
              }),
            },
          },
        },
        '409': {
          description: 'Email or username already exists',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().meta({ example: false }),
                message: z.string().meta({ example: 'Email already exists' }),
              }),
            },
          },
        },
      },
    },
  },
  '/auth/sign-in': {
    post: {
      tags: ['Auth'],
      summary: 'Sign in user',
      requestBody: {
        content: {
          'application/json': {
            schema: z.object({
              email: z.string().email().meta({ description: 'User email' }),
              password: z.string().min(1).meta({ description: 'User password' }),
              deviceId: z.uuid().meta({ description: 'Device UUID' }),
            }),
          },
        },
      },
      responses: {
        '200': {
          description: 'Sign in successful',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().meta({ example: true }),
                data: z
                  .object({
                    accessToken: z.string().meta({ description: 'JWT access token' }),
                  })
                  .meta({ id: 'AuthDataResponse' }),
              }),
            },
          },
        },
        '401': {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().meta({ example: false }),
                message: z.string().meta({ example: 'Invalid credentials' }),
              }),
            },
          },
        },
      },
    },
  },
  '/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      requestBody: {
        content: {
          'application/json': {
            schema: z.object({
              deviceId: z.uuid().meta({ description: 'Device UUID' }),
            }),
          },
        },
      },
      responses: {
        '200': {
          description: 'Token refreshed successfully',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().meta({ example: true }),
                data: z
                  .object({
                    accessToken: z.string().meta({ description: 'JWT access token' }),
                  })
                  .meta({ id: 'AuthDataResponse' }),
              }),
            },
          },
        },
        '401': {
          description: 'Missing or invalid refresh token',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().meta({ example: false }),
                message: z.string().meta({ example: 'Invalid refresh token' }),
              }),
            },
          },
        },
      },
    },
  },
  '/auth/sign-out': {
    post: {
      tags: ['Auth'],
      summary: 'Sign out current session',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Sign out successful',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().meta({ example: true }),
              }),
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().meta({ example: false }),
                message: z.string().meta({ example: 'Unauthorized' }),
              }),
            },
          },
        },
      },
    },
  },
  '/auth/sign-out-all': {
    post: {
      tags: ['Auth'],
      summary: 'Sign out all user sessions',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'All sessions revoked',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().meta({ example: true }),
              }),
            },
          },
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean().meta({ example: false }),
                message: z.string().meta({ example: 'Unauthorized' }),
              }),
            },
          },
        },
      },
    },
  },
}

const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'Moji API',
    version: '1.0.0',
    description: 'RESTful API for Moji application',
  },
  servers: [
    {
      url:
        env.NODE_ENV === 'production'
          ? 'https://moji-api.up.railway.app/api/v1'
          : `http://localhost:${env.PORT}/api/v1`,
      description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  paths: authPaths,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authentication',
      },
    },
  },
})

export function setupOpenAPI(router: Router): void {
  router.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Moji API Documentation',
    }),
  )

  router.get('/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(openApiDocument)
  })
}

export { openApiDocument }
