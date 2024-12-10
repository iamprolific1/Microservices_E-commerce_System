import { Request, Response, NextFunction } from "express";
import axios from 'axios';
import { User } from "../models/User"
import dotenv from 'dotenv';
dotenv.config();


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.log("Access Token missing")
        res.status(401).json({ message: "Access token is missing" });
        return;
    }

    try{
        const response = await axios.post(process.env.AUTH_SERVICE_VERIFY_TOKEN_URL as string,null,{
            headers: {
                authorization: `Bearer ${token}`,
            },
        });
        req.user = response.data.user;
        next();
    } catch(error) {
        console.error("Token verification failed: ", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

export const adminOnly = async (req: Request, res: Response, next: NextFunction)=> {
    const adminId = req.user?.id;
    const admin = await User.findById(adminId);
    if(!admin) {
        res.status(404).json({ message: "Admin not found" });
        return
    }
    const role = admin.role;
    if(role !== 'Admin') {
        res.status(403).json({ message: "Access denied: Admin access only" });
        return;
    }
    next();
}
