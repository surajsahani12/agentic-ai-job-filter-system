import { Queue } from 'bullmq'
import { bullmqConnection } from './redis-connection'

export const claudeQueue = new Queue('claude-categorization', {
    connection: bullmqConnection,
})