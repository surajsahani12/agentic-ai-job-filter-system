import Redis from 'ioredis'
import { env } from './env'

const redis = new Redis({
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT),
    password: env.REDIS_PASSWORD
})

redis.on('connect', () => {
    console.log('Redis connected')
})

redis.on('error', (err) => {
    console.error('Redis connection error:', err)
})

export default redis