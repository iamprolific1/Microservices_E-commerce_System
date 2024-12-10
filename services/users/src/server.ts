import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { runConnection } from './config';
import { connectRabbitMQ } from './utils/rabbitmq';
import userRoute from './routes/user.route';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
    origin: '*',
}))
app.use('/api/auth', userRoute);

app.listen(PORT, async()=> {
    console.log(`server is running on port: ${PORT}`);
    await connectRabbitMQ()
    runConnection();
})