import mongoose from 'mongoose';

enum Role {
    Admin = 'Admin',
    User = 'User'
}
export interface IUser {
    name: string;
    email: string;
    password: string;
    role: Role;
}

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: Role.User },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);