import mongoose from 'mongoose';

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: string;
}

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);