
// src/types/errors.types.ts
export class AppError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, message)   // 409 = conflict (duplicate)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string) {
        super(401, message)   // 401 = unauthorized
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(404, message)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}