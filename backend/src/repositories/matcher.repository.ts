import { UserJobMatch } from "@prisma/client"
import prisma from "../config/db"
// matcher.repository.ts
export const createUserJobMatches = async (matches: { user_id: number; job_id: number }[]) => {
    return await prisma.userJobMatch.createMany({
        data: matches,
        skipDuplicates: true
    })
}