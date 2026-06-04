import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../types/errors.types';
import { env } from '../../config/env';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../../types/express.types';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { user_id: number, email: string };
        (req as AuthenticatedRequest).user = { user_id: decoded.user_id, email: decoded.email };
        next();
    } catch (error) {
        throw new UnauthorizedError('Invalid or expired token');
    }
}