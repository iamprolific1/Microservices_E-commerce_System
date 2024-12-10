import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const authenticate = async(req: Request, res: Response, next: NextFunction)=> {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: "Access token is missing" });
        return;
    }

    try {
        const response = await axios.post(process.env.AUTH_SERVICE_VERIFY_TOKEN_URL as string, null, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });
        req.user = response.data.user;
        next();
    } catch (error) {
        console.error("Token verification failed: ", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}