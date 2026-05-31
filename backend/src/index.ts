import { env } from './config/env'
import prisma from './config/db'
import redis from './config/redis'
import express from 'express'
import cookieParser from 'cookie-parser'
import { errorHandler } from './api/middleware/error.middleware'
import authRoutes from './api/routes/auth.routes'
const app = express();
app.use(express.json());
app.use(cookieParser())

// ============ ROUTES GO HERE ============
app.use('/api/v1/auth', authRoutes)

app.use(errorHandler)


const bootStrap = async () => {
    await prisma.$connect()
    console.log("Database connected")
    console.log("Redis ready")
    app.listen(env.PORT, () => {
        console.log("Server Start at PORT" + env.PORT);
    })
    // TODO: WebSocket server
    // TODO: Pipeline scheduler
}

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err)
    process.exit(1)
})

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err)
    process.exit(1)
})

process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    redis.disconnect()
    console.log("Server shut down gracefully")
    process.exit(0)
})

bootStrap();
