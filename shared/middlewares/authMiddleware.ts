import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticateRequest extends Request {
    user?: { id: string }
}

export const authenticate = (req: AuthenticateRequest, res: Response, next: NextFunction): void=> {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) {
        res.status(401).json({ message: "User is not authorized"});
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { id: string };
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Error verifying access token: ", error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
}