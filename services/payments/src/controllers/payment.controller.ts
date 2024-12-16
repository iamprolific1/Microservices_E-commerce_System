import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Payment } from '../models/Payment';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-11-20.acacia'});


export const createPayment = async(req: Request, res: Response): Promise<void>=> {
    try{
        const { orderId, amount, currency } = req.body;

        const userId = req.user?.id || '';

        if(!orderId || !amount || !currency) {
            res.status(400).json({ message: "missing required fields: userId, orderId or amount" });
            return;
        }

        const accessToken = req.headers.authorization;
        if(!accessToken) {
            res.status(401).json({ message: "Authorization token is missing" });
            return;
        }

        // create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency,
            metadata: { orderId, userId }
        })

        console.log("Payment Intent: ", paymentIntent);

        //save payment details in database
        const payment = await Payment.create({
            userId,
            orderId,
            amount,
            currency,
            paymentIntentId: paymentIntent.id
        });
        res.status(201).json({ 
            message: "Payment initiated successfully", 
            clientSecret: paymentIntent.client_secret, 
            payment 
        });
        return;
    } catch (error) {
        console.error("Error initiating payment: ", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

export const verifyPayment = async(req: Request, res: Response): Promise<void>=> {
    try {
        const { paymentIntentId } = req.body;
        if (!paymentIntentId) {
            res.status(400).json({ message: "PaymentIntentId is required" });
            return;
        }
        // retrieve payment intent status from stripe

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        //handle various payment statuses
        switch(paymentIntent.status) {
            case 'succeeded':
                // update payment record in the database
                const payment = await Payment.findOneAndUpdate(
                    { paymentIntentId },
                    { status: "Succeeded" },
                    { new: true }
                );
                res.status(200).json({
                    message: "payment verified successfully",
                    payment
                });
                break;
            
            case 'requires_payment_method':
                res.status(400).json({
                    message: "Payment not verified. A valid payment method is required",
                    status: paymentIntent.status,
                    next_action: paymentIntent.next_action
                });
                break;
            
            case 'processing': 
                res.status(202).json({
                    message: 'Payment is still processing. Please check again later.',
                    status: paymentIntent.status,
                });
                break;

            default: 
                res.status(400).json({
                    message: "Payment not verified",
                    status: paymentIntent.status
                });
                break;
        }
    } catch (error: any) {
        console.error("Error verifying payment: ", error);
        //handling stripe API errors

        if(error.type === 'StripeAPIError') {
            res.status(400).json({
                message: error.message
            });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}