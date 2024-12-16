import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payment.route';
import { connectRabbitMQ } from './utils/rabbitmq';

import { runConnection } from './config/';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: '*'
}))
app.use('/api/payments', paymentRoutes);

app.listen(process.env.PORT, async()=> {
    console.log(`server is running on port ${process.env.PORT}`)
    runConnection();
    await connectRabbitMQ();
})