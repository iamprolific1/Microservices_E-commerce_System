import mongoose from "mongoose";

export interface DbConfig {
    uri: string;
    dbName?: string;
}

export class DbConnection implements DbConfig {
    uri: string;
    dbName?: string | undefined;

    constructor(config: DbConfig) {
        this.uri = config.uri;
        this.dbName = config.dbName;
    }

    async connect(): Promise<void> {
        try {
            const options = { dbName: this.dbName };
            await mongoose.connect(this.uri, options);
            console.log('Connected to mongoDB database');
            return;
        } catch (error) {
            console.error('Error connecting to database: ', error);
            return;
        }
    }

    async close(): Promise<void> {
        try {
            await mongoose.disconnect();
            console.log("Disconnected from MongoDB");
        } catch (error) {
            console.error("Error disconnecting from database: ", error);
            return;
        }
    }
}