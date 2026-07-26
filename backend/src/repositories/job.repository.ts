import prisma from '../config/db'
import { Prisma, Job } from '@prisma/client'
import { ScrapedJob } from '../types/job.types';


export const createJobs = async (scrapedJobs: ScrapedJob[]): Promise<Job[]> => {
    return await prisma.job.createManyAndReturn({
        data: scrapedJobs,
        skipDuplicates: true
    })

}

export const findJobById = async (id: number) => {
    return await prisma.job.findUnique({ where: { id } })
}

export const findJobsByUserId = async (userId: number) => {
    return await prisma.job.findMany({ where: { id: userId } })
}

