import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { redisClient } from '../utils/redisClient';
import { publishMessage } from '../utils/rabbitmq';
import axios from 'axios';

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

export const createOrder = async (req: Request, res: Response) => {
    try{
        const { items, totalAmount } = req.body;
        const userId = req.user?.id;
        if(!userId) {
            res.status(404).json({ message: "Unauthorized: user not found" });
            return;
        }

        const accessToken = req.headers.authorization;
        if(!accessToken) {
            res.status(401).json({ message: "Authorization token is missing" });
            return;
        }

        // extract productIds from Items
        const productIds = items.map((item: { productId: string }) => item.productId);
        // validate productIds by calling the product-service
        const validationResponse = await axios.post(`${process.env.VALIDATE_PRODUCT_SERVICE_URL as string}`,{ productIds }, 
            {
                headers: {
                    authorization: accessToken
                }
            }
        );

        if (validationResponse.status !== 200) {
            res.status(validationResponse.status).json({
                message: validationResponse.data.message,
            });
            return;
        }
        const { validProductIds } = validationResponse.data;

        // check if any products in items array are invalid
        const invalidItems = items.filter(
            (item: { productId: string }) => !validProductIds.includes(item.productId)
        );
        if(invalidItems.length > 0) {
            res.status(404).json({
                message: "some products in the order are invalid",
                invalidProductIds: invalidItems.map((item: { productId: string }) => item.productId)
            });
            return;
        }

        // create the order
        const order = new Order({ userId, items, totalAmount });
        await order.save();

        //publish event 
        await publishMessage('order-event', { event: 'OrderCreated', order });
        res.status(201).json({ message: "Order created successfully", order });
        return;
    } catch(error) {
        console.error("Error creating order: ", error);

        // handle errors from product-service or intenal error
        if(axios.isAxiosError(error) && error.response) {
            res.status(error.response.status).json({
                message: error.response.data.message || "Error communicating with product-service"
            });
            return;
        } else {
            res.status(500).json({ message: "Internal server error" });
            return;
        }
    }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ message: 'Orders retrieved successfully', orders });
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get order by ID with caching
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.id;

        // Check Redis cache
        const cachedOrder = await redisClient.get(`order:${orderId}`);
        if (cachedOrder) {
            res.status(200).json({ message: 'Order retrieved from cache', order: JSON.parse(cachedOrder) });
            return
        }

        const order = await Order.findById(orderId);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        // Cache the order
        await redisClient.setEx(`order:${orderId}`, 3600, JSON.stringify(order));
        res.status(200).json({ message: 'Order retrieved successfully', order });
    } catch (error) {
        console.error('Error retrieving order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        // Publish event
        await publishMessage('order-events', { event: 'OrderUpdated', order });

        res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete an order
export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        // Publish event
        await publishMessage('order-events', { event: 'OrderDeleted', orderId: req.params.id });

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get order history for a user
export const getOrderHistory = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId });
        if (!orders.length) {
            res.status(404).json({ message: 'No orders found for this user' });
            return;
        }

        await publishMessage('order-events', { event: 'OrderHistoryRetrieved', orders })
        res.status(200).json({ message: 'Order history retrieved successfully', orders });
    } catch (error) {
        console.error('Error retrieving order history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const validateOrders = async(req: Request, res: Response)=> {
    try{
        const { orderIds } = req.body;
        if(!Array.isArray(orderIds) || orderIds.length === 0){
            res.status(400).json({ message: "Order Ids are required & must be an array" });
            return;
        }

        const validOrders = await Order.find({ _id: { $in: orderIds } }).select('_id');
        const validOrderIds = validOrders.map(order => order._id.toString());

        const missingOrderIds = orderIds.filter(id => !validOrderIds.includes(id));
        if(missingOrderIds.length > 0) {
            res.status(404).json({ message: "Some order Ids are invalid", missingOrderIds });
            return;
        }
        
        await publishMessage('order-events', { event: 'OrderValidated', validOrderIds });
        res.status(200).json({ message: "All orders are valid", orderIds });
        return;
    } catch(error) {
        console.error("Error validating orderId: ", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}