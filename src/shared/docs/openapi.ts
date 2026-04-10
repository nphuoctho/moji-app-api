import type { Application, Request, Response } from 'express'
import swaggerUi from 'swagger-ui-express'
import { createDocument } from 'zod-openapi'
import { env } from '@/config/env'
import { authPaths } from './apis/auth.paths'
import { securitySchemes } from './security'

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
  paths: {
    ...authPaths,
  },
  components: {
    securitySchemes,
  },
})

export function setupOpenAPI(app: Application): void {
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Moji API Documentation',
    }),
  )

  app.get('/docs.json', (_req: Request, res: Response) => {
    res.type('application/json').send(openApiDocument)
  })
}

export { openApiDocument }
