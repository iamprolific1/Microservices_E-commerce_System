import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { runConnection } from './config/';
import { loginUser } from './controller/authController';
import authRouter from './routes/authUser.route';

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use('/api/auth', authRouter);

app.listen(process.env.PORT, ()=> {
    console.log(`server is running on PORT: ${process.env.PORT}`);
    runConnection()
})
