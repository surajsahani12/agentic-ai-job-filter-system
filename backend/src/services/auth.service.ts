import bcrypt from 'bcrypt'
import { AppError, ConflictError, UnauthorizedError } from "../types/errors.types"
import { findUserByEmail, createUser, updateRefreshToken, updateLastLogin, findUserById } from "../repositories/user.repository"
import { env } from "../config/env"
import jwt from 'jsonwebtoken'
import { User } from '@prisma/client'

type SafeUser = Omit<User, 'password_hash' | 'refresh_token'>

interface RegisterInput {
    full_name: string
    email: string
    password: string
    confirm_password: string
}

export const registerUser = async (
    data: RegisterInput
): Promise<{ access_token: string; refresh_token: string; user: SafeUser }> => {

    if (!data.email || !data.password) {
        throw new AppError(400, 'Email and password are required')
    }

    if (data.password !== data.confirm_password) {
        throw new AppError(400, 'Passwords do not match')
    }

    const existingUser = await findUserByEmail(data.email)
    if (existingUser) {
        throw new ConflictError('Email already registered')
    }

    const password_hash = await bcrypt.hash(data.password, 10)

    const newUser = await createUser({
        full_name: data.full_name,
        email: data.email,
        password_hash,
    })

    const payload = { user_id: newUser.id, email: newUser.email }
    const access_token = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' })
    const refresh_token = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

    const updatedUser = await updateRefreshToken(newUser.id, refresh_token)
    const { password_hash: _, refresh_token: __, ...user } = updatedUser

    return { access_token, refresh_token, user }
}

export const loginUser = async (email: string, password: string): Promise<{ access_token: string, refresh_token: string, user: SafeUser }> => {
    const existingUser = await findUserByEmail(email)
    if (!existingUser) throw new UnauthorizedError('Invalid Credentials')


    const isMatch = await bcrypt.compare(password, existingUser.password_hash)
    if (!isMatch) {
        throw new UnauthorizedError('Invalid Credentials')
    }

    const access_token = jwt.sign({ user_id: existingUser.id, email: existingUser.email }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' })
    const refresh_token = jwt.sign({ user_id: existingUser.id, email: existingUser.email }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
    await updateRefreshToken(existingUser.id, refresh_token)
    const lastLoggedIn = await updateLastLogin(existingUser.id)
    const { password_hash: _, refresh_token: __, ...user } = lastLoggedIn

    return { access_token, refresh_token, user }
}

export const refreshAccessToken = async (refreshToken: string): Promise<{ access_token: string }> => {
    let payload: { user_id: number, email: string }
    try {
        payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { user_id: number, email: string }
    } catch {
        throw new UnauthorizedError('Invalid refresh token')
    }

    const user = await findUserById(payload.user_id)
    if (!user || refreshToken !== user.refresh_token) {
        throw new UnauthorizedError('Invalid refresh token')
    }

    const access_token = jwt.sign(
        { user_id: user.id, email: user.email },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
    )
    return { access_token }
}

export const logoutUser = async (userId: number): Promise<void> => {
    await updateRefreshToken(userId, null)
}