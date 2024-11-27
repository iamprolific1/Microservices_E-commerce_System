import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { runConnection } from './config'
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
    runConnection();
})