import { Request, Response } from "express";
import axios from 'axios';
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { publishMessage } from "../utils/rabbitmq";
import dotenv from 'dotenv';
dotenv.config();


export const registerUser = async(req: Request, res: Response)=> {
    const { name, email, password, role } = req.body;

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
            password: hashedPassword,
            role
        })
        await user.save();
        res.status(201).json({ message: "User is created successfully!", user });
        return;
    } catch (error) {
        console.error("Error registering new user: ", error);
        return;
    }
}

export const loginUser = async(req: Request, res: Response)=> {
    const { email, password } = req.body;

    try {
        // calling Auth-service to authenticate user
        const response = await axios.post(process.env.AUTH_SERVICE_LOGIN_URL as string, { email, password });
        
        const { accessToken, refreshToken } = response.data;
        res.status(200).json({
            message: "User authenticated successfully",
            accessToken,
            refreshToken
        });
        return;
    } catch (error) {
        console.error("Error authenticating user--: ", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

export const refreshToken = async(req: Request, res: Response)=> {
    const { token } = req.body;
    try{
        const response = await axios.post(process.env.AUTH_SERVICE_REFRESH_URL as string, { token });
        const { accessToken } = response.data;
        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken
        });
        return;
    } catch(error) {
        console.error("Error refreshing access token: ", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }

}

export const getAllUsers = async(req: Request, res: Response)=> {
    try{
        const users = await User.find({ role: 'User' });
        if(!users) {
            res.status(404).json({ message: "There are no users found." });
            return;
        }
        res.status(200).json({ message: "Users data retrieved successfully", users });
        return;
    } catch(error) {
        console.error("Error retrieving users data: ", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
};

export const getUser = async(req: Request, res: Response)=>{
    const { id } = req.params;
    try{
        if(!id) {
            res.status(404).json({ message: "Invalid ID provided" });
            return;
        }
    
        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ message: "User with specified ID found",  user })
        return;
    } catch (error) {
        console.error("Error getting user by ID: ", error);
        error;
    }
}

export const updateUserData = async(req: Request, res: Response)=> {
    const { id } = req.params;
    const { name, email } = req.body;

    try{
        const user = await User.findById(id);
        if(!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        user.name = name;
        user.email = email;
        await user.save();
        res.status(200).json({ message: "User data updated successfully" });
        return;
    } catch(error) {
        console.error("Error updating user data: ", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}