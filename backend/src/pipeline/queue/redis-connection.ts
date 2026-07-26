import Redis from 'ioredis'
import { env } from '../../config/env'

export const bullmqConnection = new Redis({
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT),
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,  // required by BullMQ
})