import { DbConfig, DbConnection } from "./db";
import dotenv from 'dotenv';
dotenv.config();

const config: DbConfig = {
    uri: process.env.MONGODB_URI as string || '',
    dbName: process.env.MONGODB_DB_NAME,
}

const dbConnection = new DbConnection(config);

export async function runConnection() {
    try {
        await dbConnection.connect();
    } catch (error) {
        await dbConnection.close();
        console.error("Error in application: ", error)
    }
}