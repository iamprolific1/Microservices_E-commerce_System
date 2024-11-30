import mongoose, { Document, Schema } from 'mongoose';

export interface IAuthUser extends Document {
    email: string;
    refreshToken?: string;
    createdAt: Date;
}

const AuthUserSchema: Schema<IAuthUser> = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    refreshToken: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: false })

export const AuthUser = mongoose.model<IAuthUser>('AuthUser', AuthUserSchema);