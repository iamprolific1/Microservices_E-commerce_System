import Redis from 'redis';
import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../utils/redisClient';

const initializeRedis = async()=> {
    try {
        if(!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error("Error connecting to redis: ", error);
    }
}
initializeRedis();

export const rateLimiter = async(req: Request, res: Response, next: NextFunction)=> {
    const ip = req.ip;
    try {
        
        const record = await redisClient.get(`ip:${ip}`);
        const currentTime = Math.floor(Date.now() / 1000);
        const ttl = 60; // time to live in seconds
        const requestLimit = 10 // max request allowed in ttl

        if(record) {
            const data = JSON.parse(record);
            const remainingTime = ttl - (currentTime - data.startTime);

            if(data.count >= requestLimit && remainingTime > 0) {
                res.status(429).json({ message: `Too many requests, try again in ${remainingTime} seconds` });
                return;
            } else {
                data.count++;
                data.startTime = currentTime;
                await redisClient.setEx(`ip:${ip}`, ttl, JSON.stringify(data));
                next();
            }
        } else {
            await redisClient.setEx(`ip:${ip}`, ttl, JSON.stringify({ count: 1, startTime: currentTime }));
            next();
        }
    } catch (error) {
        res.status(500).json({ message: "Error processing request" });
        throw error;
    }
}