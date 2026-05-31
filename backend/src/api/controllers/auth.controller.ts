import { Request, Response, NextFunction } from "express";
import * as authService from "../../services/auth.service";
import { env } from "../../config/env"
import { UnauthorizedError } from "../../types/errors.types";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { full_name, email, password, confirm_password } = req.body

        const result = await authService.registerUser({ full_name, email, password, confirm_password });

        res.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({ message: "User Created", user: result.user, access_token: result.access_token })
    }
    catch (e) {
        next(e)
    }

}

export const login = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password)
        res.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({ message: "Logged in Successfully", user: result.user, access_token: result.access_token })

    } catch (error) {
        next(error)
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user.user_id
        await authService.logoutUser(user_id)
        res.clearCookie('refresh_token')
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies?.refresh_token

        if (!refresh_token) {
            throw new UnauthorizedError('Missing refresh token')
        }

        const result = await authService.refreshAccessToken(refresh_token)

        res.status(200).json({
            message: 'Access token refreshed',
            access_token: result.access_token
        })
    } catch (error) {
        next(error)
    }
}