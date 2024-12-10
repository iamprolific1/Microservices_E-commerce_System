import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { AuthUser } from "../models/AuthUser";
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../../../shared/src/utils/jwt-utils';
import axios from "axios";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;


export const loginUser = async(req: Request, res: Response)=> {
    const { email, password } = req.body;

    try {
        const response = await axios.post(`${USER_SERVICE_URL}/api/auth/users/email`, { email });
        const user = response.data;
        if(!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const verifyPassword = await bcrypt.compare(password, user.password);
        if(!verifyPassword) {
            res.status(403).json({ message: "Invalid credentials "});
            return;
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        const userId = user._id;
        
        // Update or save refreshToken in AuthUser collection
        const existingAuthUser = await AuthUser.findOne({ email });
        if (existingAuthUser) {
            existingAuthUser.refreshToken = refreshToken;
            await existingAuthUser.save();
        } else { 
            const authUser = new AuthUser({
                email,
                refreshToken
            })
            await authUser.save();
        }
        res.status(200).json({ accessToken, refreshToken, userId });
        return;
    } catch (error) {
        console.error("Error authenticating user: ", error);
        res.status(500).json({ message: "Internal serval error" });
        return;
    }
}

export const refreshToken = async(req: Request, res: Response)=> {
    const { token } = req.body;

    try {
        if(!token) {
            res.status(400).json({ message: "Refresh token is required" });
            return;
        }

        const decoded = verifyToken(token, process.env.REFRESH_TOKEN_SECRET as string);
        const userId = decoded.id;
        const response = await axios.post(`${USER_SERVICE_URL}/api/auth/users/userId`, { userId })
        const user = response.data;

        if(!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const accessToken = generateAccessToken(user);
        res.status(200).json({ accessToken });
    } catch (error) {
        console.error("Error refreshing access token: ", error);
        res.status(403).json({ message: "Invalid refresh token" });
        return;
    }
}

export const Verify_Token_To_Authenticate_User = async(req: Request, res: Response)=>{
    const token = req.headers['authorization']?.split(' ')[1];

    if(!token) {
        res.status(401).json({ message: 'Access token required' });
        return;
    }

    try{
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string ) as { id: string };
        res.status(200).json({ user: decoded });
    } catch(error) {
        console.error("Error verifying access token: ", error);
        res.status(403).json({ message: "Invalid access token" });
        return;
    }
}