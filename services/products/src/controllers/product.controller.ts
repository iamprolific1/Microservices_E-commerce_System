import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { consumeMessage } from '../utils/rabbitmq';

export const createProduct = async(req: Request, res: Response)=> {
    try{
        await consumeMessage('user-events', async(message)=> {
            if(message.event === 'UserCreated') {
                // const userId = message.userId;
                console.log("User is created");
            }
        })
        const { name, description, price, category, stock, images } = req.body;

        const product = new Product({ name, description, price, category, stock, images });
        await product.save();
        res.status(201).json({ message: "Product created successfully", product });
        return;
    } catch(error) {
        console.error('Error creating new products: ', error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

export const getAllProducts = async(req: Request, res: Response)=> {
    try{
        const products = await Product.find();
        if(!products){
            res.status(404).json({ message: 'There are no products found in the database' });
            return;
        }
        res.status(200).json({ message: 'Products retrieved successfully', products });
        return;
    } catch(error){
        res.status(500).json({ message: "Internal server error", error });
        return
    }
}