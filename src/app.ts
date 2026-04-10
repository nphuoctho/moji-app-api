import { randomUUID } from 'node:crypto'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'
import { env } from './config/env'
import router from './modules/index.routes'
import { setupOpenAPI } from './shared/docs/openapi'
import { errorMiddleware } from './shared/middlewares/error.middleware'
import { notFoundMiddleware } from './shared/middlewares/not-found.middleware'
import { logger } from './shared/utils/logger.util'
import { sendData } from './shared/utils/response.util'

export function createApp(): express.Application {
  const app = express()

  // Trust proxy
  app.set('trust proxy', 1)

  // Security & logging
  app.use(pinoHttp({ logger }))
  app.use(helmet())
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    }),
  )

  // Compression & parsing
  app.use(compression())
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())

  // Middleware
  app.use((_, res, next) => {
    res.locals.requestId = randomUUID()
    next()
  })

  // Routes
  app.get('/health', (_req, res) =>
    sendData(res, { status: 'ok', timestamp: new Date().toISOString() }),
  )
  app.get('/', (_req, res) =>
    sendData(res, { message: 'Welcome to moji-api-app! Please visit /api/v1 for API endpoints.' }),
  )
  app.use('/api/v1', router)
  setupOpenAPI(app)

  // Error handling
  app.use(notFoundMiddleware)
  app.use(errorMiddleware)

  return app
}
