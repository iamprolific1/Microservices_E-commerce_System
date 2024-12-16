import { DbConfig, DbConnection } from "./db";
import dotenv from 'dotenv';
dotenv.config();

const config: DbConfig = {
    uri: process.env.MONGO_URI as string || '',
    dbName: process.env.MONGO_DB
}

const dbConnection = new DbConnection(config);

export async function runConnection() {
    try{
        await dbConnection.connect();
    } catch (error) {
        await dbConnection.close();
        console.error("Error in application: ", error);
    }
}