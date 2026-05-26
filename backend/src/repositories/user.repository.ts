import prisma from '../config/db'
import { Prisma } from '@prisma/client'

export const createUser = async (data: Prisma.UserCreateInput) => {
    return await prisma.user.create({ data })
}

export const findUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({ where: { email } })
}

export const findUserById = async (id: number) => {
    return await prisma.user.findUnique({ where: { id } })
}

export const updateUser = async (id: number, data: Prisma.UserUpdateInput) => {
    return await prisma.user.update({ where: { id }, data })
}

export const deleteUser = async (id: number) => {
    return await prisma.user.delete({ where: { id } })
}

export const updateRefreshToken = async (id: number, refreshToken: string | null) => {
    return await prisma.user.update({
        where: { id },
        data: { refresh_token: refreshToken }
    })
}

export const updateLastLogin = async (id: number) => {
    return await prisma.user.update({
        where: { id },
        data: { last_login: new Date() }
    })
}