import prisma from '../config/db'
import { Prisma } from '@prisma/client'

export const findPreferencesByUserId = async (id: number) => {
    return await prisma.userPreferences.findUnique({ where: { user_id: id } })
}

export const findAllUserPreferences = async () => {
    return await prisma.userPreferences.findMany();
}

export const upsertPreferences = async (id: number, data: Prisma.UserPreferencesUpdateInput) => {
    return await prisma.userPreferences.upsert({
        where: { user_id: id },
        update: data,
        create: {
            ...data,
            user: { connect: { id } }
        } as Prisma.UserPreferencesCreateInput
    })
}