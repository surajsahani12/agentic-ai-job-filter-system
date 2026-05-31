import { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env';
import { AppError } from '../../types/errors.types';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (!(err instanceof AppError) && env.NODE_ENV === 'development') {
        console.error(err.stack)
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            const error = new AppError(409, 'Resource already exists')
            return res.status(error.statusCode).json({
                error: error.message
            })
        }

        if (err.code === 'P2025') {
            const error = new AppError(404, 'Resource not found')
            return res.status(error.statusCode).json({
                error: error.message
            })
        }
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message
        })
    }


    res.status(500).json({
        error: 'Internal server error'
    })
}