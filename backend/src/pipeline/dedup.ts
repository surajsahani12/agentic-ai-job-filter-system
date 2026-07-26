import { ScrapedJob } from '../types/job.types';
import { createJobs } from '../repositories/job.repository'
import { Job } from '@prisma/client'

export const dedupJobs = async (scrapedJobs: ScrapedJob[]): Promise<Job[]> => {
    // calls the repository function, returns its result
    return await createJobs(scrapedJobs)
}