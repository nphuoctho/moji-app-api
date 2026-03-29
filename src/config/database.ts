import mongoose, { type ConnectOptions } from 'mongoose'
import { logger } from '@/shared/utils/logger'
import { env } from './env'

type DatabaseConfig = {
  uri: string
  options?: ConnectOptions
}

type DatabaseStatus =
  | 'disconnected'
  | 'connected'
  | 'connecting'
  | 'disconnecting'
  | 'uninitialized'

const DEFAULT_CONNECT_OPTIONS: ConnectOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
}

export class Database {
  private static instance: Database | null = null
  private readonly config: DatabaseConfig
  private connectPromise: Promise<void> | null = null
  private listenersAttached = false

  private constructor(config: DatabaseConfig) {
    this.config = config
  }

  async connect(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      logger.debug('MongoDB is already connected. Skipping new connect call.')
      return
    }

    if (this.connectPromise) {
      return this.connectPromise
    }

    this.setupListeners()

    this.connectPromise = mongoose
      .connect(this.config.uri, {
        ...DEFAULT_CONNECT_OPTIONS,
        ...this.config.options,
      })
      .then(() => {
        logger.info('Connected to MongoDB')
      })
      .catch((error: unknown) => {
        logger.error({ err: error }, 'Error occurred while connecting to database')
        throw error
      })
      .finally(() => {
        this.connectPromise = null
      })

    return this.connectPromise
  }

  async connectWithRetry(retries = 5, delay = 5000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.connect()
        return
      } catch (error: unknown) {
        const retriesLeft = retries - attempt
        logger.warn(
          { err: error, retriesLeft, attempt, retries },
          'Attempt to connect to database failed',
        )

        if (retriesLeft <= 0) {
          break
        }

        await this.sleep(delay)
      }
    }

    throw new Error('Failed to connect to database after multiple attempts')
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database({
        uri: env.MONGO_URI,
      })
    }
    return Database.instance
  }

  async disconnect(): Promise<void> {
    if (mongoose.connection.readyState === 0) {
      logger.debug('MongoDB is already disconnected. Skipping disconnect call.')
      return
    }

    try {
      await mongoose.disconnect()
      logger.info('Disconnected from MongoDB')
    } catch (error: unknown) {
      logger.error({ err: error }, 'Error occurred while disconnecting from database')
      throw error
    }
  }

  getStatus(): DatabaseStatus {
    const state = mongoose.connection.readyState

    switch (state) {
      case 0:
        return 'disconnected'
      case 1:
        return 'connected'
      case 2:
        return 'connecting'
      case 3:
        return 'disconnecting'
      default:
        return 'uninitialized'
    }
  }

  private setupListeners(): void {
    if (this.listenersAttached) {
      return
    }

    mongoose.connection.on('connected', () => logger.info('Database connection established'))
    mongoose.connection.on('error', (err) => logger.error({ err }, 'Database connection error'))
    mongoose.connection.on('disconnected', () =>
      logger.warn('Database connection lost. Attempting to reconnect...'),
    )

    this.listenersAttached = true
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export async function connectDatabase(retries = 5, delay = 5000): Promise<void> {
  const database = Database.getInstance()

  try {
    await database.connectWithRetry(retries, delay)
  } catch (error: unknown) {
    logger.fatal({ err: error }, 'Failed to connect to MongoDB')
    throw error
  }
}
