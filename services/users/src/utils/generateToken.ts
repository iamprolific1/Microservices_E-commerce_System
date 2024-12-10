// import { Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// dotenv.config();

// export const generateAccessToken = (user: any)=> {
//     const payload = {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//     }
//     const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '2m' });
//     // res.status(200).json({ message: "Access token generated successfully" });
//     return accessToken;
// }

// export const generateRefreshToken = (user: any)=>{
//     const payload = {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//     };
//     const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '15m' });
//     // res.status(200).json({ message: "Refresh token generated successfully" });
//     return refreshToken;
// }