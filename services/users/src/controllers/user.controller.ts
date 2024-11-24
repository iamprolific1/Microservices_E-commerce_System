import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";


export const registerUser = async(req: Request, res: Response)=> {
    const { name, email, password} = req.body;

    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            res.status(403).json({ message: "User already exist" });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword
        })
        res.status(201).json({ message: "User is created successfully!", user });
        return;
    } catch (error) {
        console.error("Error registering new user: ", error);
        return;
    }
}