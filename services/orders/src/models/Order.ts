import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Order extends Document {
    _id: Types.ObjectId;
    userId: string;
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
    userId: { type: String, required: true },
    items: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

export const Order = mongoose.model<Order>('Order', OrderSchema);
