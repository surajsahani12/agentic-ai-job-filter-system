import { Worker } from 'bullmq'
import { bullmqConnection } from '../redis-connection'

export const startClaudeWorker = () => {
    const worker = new Worker(
        'claude-categorization',
        async (job) => {
            console.log('Processing job:', job.data);
        },
        { connection: bullmqConnection }
    );

    return worker;
};