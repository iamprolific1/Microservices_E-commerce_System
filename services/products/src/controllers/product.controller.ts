import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { publishMessage } from '../utils/rabbitmq';
import { redisClient } from '../utils/redisClient';

const initializeRedis = async()=> {
    try{
        if(!redisClient.isOpen) {
            await redisClient.connect();
            console.log("Connected to redis");
        }
    } catch(error) {
        console.error("Error connecting to redis: ", error);
    }
}

initializeRedis();

redisClient.on('error', (err)=> console.error('Redis Error: ', err));

export const createProduct = async(req: Request, res: Response)=> {
    try{
        const { name, description, price, category, stock, images } = req.body;

        const userId = req.user?.id;
        if(!userId) {
            res.status(403).json({ message: "Unauthorized: user ID not found" });
            return;
        }
        const product = new Product({ name, description, price, category, stock, images, userId });
        await product.save();
        await publishMessage('product-events', { 
            event: "ProductCreated", 
            product 
        })
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
            res.status(404).json({ message: 'No Product Found.' });
            return;
        }

        await publishMessage('product-events', {
            event: 'ProductRetrieved',
            products
        })
        
        res.status(200).json({ message: 'Products retrieved successfully', products });
        return;
    } catch(error){
        res.status(500).json({ message: "Internal server error", error });
        return
    }
}

export const getProductById = async(req: Request, res: Response)=> {
    try {
        //check cache to find product first
        const cacheData = await redisClient.get(`product:${req.params.id}`);
        if(cacheData) {
            res.status(200).json({
                message: "Product retrieved from cache",
                product: JSON.parse(cacheData)
            });
            return;
        }
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        // cache the data if found
        await redisClient.setEx(`product:${req.params.id}`, 360, JSON.stringify(product));

        await publishMessage('product-events', {
            event: 'ProductRetrieved',
            product
        })
        res.status(200).json({ message: "Product with specified ID retrieved successfully", product });
        return;
    } catch (error) {
        console.error("Error retrieving product by ID: ", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

export const updateProduct = async(req: Request, res: Response)=> {
    try{
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            res.status(404).json({ message: "Product not found "});
            return;
        }
        await publishMessage('product-events', {
            event: 'ProductUpdated',
            product
        })
        res.status(200).json({ message: "Product updated successfully", product });
        return;
    } catch(error) {
        res.status(500).json({ message: "Internal server error", error });
        return;
    }
}

export const deleteProduct = async(req: Request, res: Response)=> {
    try{
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        await publishMessage('product-events', {
            event: 'ProductDeleted',
            productId: req.params.id
        })
        res.status(200).json({ message: "Product deleted successfully" });
        return;
    } catch(error) {
        res.status(500).json({ message: "Internal server error", error });
        return;
    }
};

export const validateProducts = async(req: Request, res: Response)=> {
    try{
        const { productIds } = req.body;
        if(!Array.isArray(productIds) || productIds.length === 0){
            res.status(400).json({ message: "Product Ids are required & must be an array" });
            return
        }

        //find all valid products matching the provided Ids
        const validProducts = await Product.find({ _id: { $in: productIds } }).select('_id');
        const validProductIds = validProducts.map(product => product._id.toString());

        //Determine missing productIds by comparing input with valid Ids
        const missingProductsIds = productIds.filter(id => !validProductIds.includes(id));
        if(missingProductsIds.length > 0) {
            res.status(404).json({ message: "Some products were not found", missingProductsIds });
            return;
        }
        
        await publishMessage('product-events', { event: 'ProductValidated', validProductIds });
        res.status(200).json({ message: "All products are valid", validProductIds });
        return;
    }catch(error) {
        console.error('Error validating products: ', error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}