import { createClient } from "redis";
import dotenv from 'dotenv';
dotenv.config();

export const redisClient = createClient({
    password: process.env.REDIS_CLIENT_PASSWORD,
    socket: {
        host: process.env.REDIS_CLIENT_HOST,
        port: process.env.REDIS_CLIENT_PORT as number | undefined,
    },
});
