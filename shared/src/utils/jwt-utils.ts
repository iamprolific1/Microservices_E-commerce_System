import jwt from "jsonwebtoken";

export const generateAccessToken = (user: any)=> {
    return jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: '15m' }
    )
};

export const generateRefreshToken = (user: any)=> {
    return jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: '7d' }
    )
}

export const verifyToken = (token: string, secret: string)=> {
    return jwt.verify(token, secret) as { id: string };
}