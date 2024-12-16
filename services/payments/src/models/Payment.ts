import mongoose, { Schema, Document } from "mongoose";

interface Payment extends Document {
    userId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: 'Pending' | 'Succeeded' | 'Failed';
    paymentIntentId: string;
}

export const paymentSchema: Schema = new Schema({
    userId: { type: String, required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
    status: { type: String, required: true, enum: ['Pending', 'Completed'], default: 'Pending' },
    paymentIntentId: { type: String, required: true },
}, { timestamps: true });

export const Payment = mongoose.model<Payment>('Payment', paymentSchema);