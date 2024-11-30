import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { runConnection } from './config';
import { connectRabbitMQ } from './utils/rabbitmq';
import productRouter from './routes/product.route';

const app = express();
const PORT = process.env.PORT || 3002;


app.use(express.json());
app.use('/api/products', productRouter);

app.listen(PORT, async()=> {
    console.log(`Server is running on port ${PORT}`);
    await connectRabbitMQ();
    runConnection();
})