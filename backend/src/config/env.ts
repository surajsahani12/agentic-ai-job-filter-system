import dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    DATABASE_HOST: z.string().min(1, 'DATABASE_HOST is required'),
    DATABASE_PORT: z.string().default('5432'),
    DATABASE_USER: z.string().min(1, 'DATABASE_USER is required'),
    DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD is required'),
    DATABASE_NAME: z.string().min(1, 'DATABASE_NAME is required'),
    GMAIL_USER: z.string().min(1, 'GMAIL_USER is required'),
    GMAIL_APP_PASSWORD: z.string().min(1, 'GMAIL_APP_PASSWORD is required'),
    REDIS_HOST: z.string().min(1, 'REDIS_HOST is required'),
    REDIS_PORT: z.string().default('6379'),
    REDIS_PASSWORD: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
    AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
    AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
    AWS_S3_BUCKET_NAME: z.string().min(1, 'AWS_S3_BUCKET_NAME is required'),
    CLAUDE_API_URL: z.string().min(1, 'CLAUDE_API_URL is required'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    LOG_FILE_PATH: z.string().default('logs/app.log'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),

});

export const env = envSchema.parse(process.env);