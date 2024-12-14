import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { runConnection } from './config';
import { connectRabbitMQ } from './utils/rabbitmq';
import orderRoutes from './routes/order.route';
dotenv.config();

export const app = express();
app.use(express.json());
app.use(cors({
    origin: '*'
}))
app.use('/api/orders', orderRoutes);

app.listen(process.env.PORT, async()=> {
    console.log(`Server is running on port: ${process.env.PORT}`);
    await connectRabbitMQ();
    runConnection();
})