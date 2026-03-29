import compression from 'compression'
import express from 'express'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'
import router from './modules/index.routes'
import { errorMiddleware } from './shared/middlewares/error.middleware'
import { notFoundMiddleware } from './shared/middlewares/not-found.middleware'
import { logger } from './shared/utils/logger'

export function createApp(): express.Application {
  const app = express()

  app.use(pinoHttp({ logger }))
  app.use(helmet())
  app.use(compression())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toString() }))

  app.get('/', (_req, res) => {
    return res.send('Welcome to moji-api-app! Please visit /api/v1 for API endpoints.')
  })

  app.use('/api/v1', router)

  app.use(notFoundMiddleware)

  app.use(errorMiddleware)

  return app
}
