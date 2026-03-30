import { createApp } from './app'
import { connectDatabase, Database } from './config/database'
import { env } from './config/env'
import { logger } from './shared/utils/logger.util'

async function bootstrap(): Promise<void> {
  await connectDatabase()

  const app = createApp()
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'Server started')
  })

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Shutting down...')

    try {
      await Database.getInstance().disconnect()
    } catch (err) {
      logger.error({ err }, 'Failed to disconnect database during shutdown')
    }

    server.close(() => process.exit(0))
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('unhandledRejection', (err) => {
    logger.fatal({ err }, 'Unhandled rejection')
    process.exit(1)
  })
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})
