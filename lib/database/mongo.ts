import { MongoClient, ServerApiVersion } from "mongodb";

const uri = String(process.env.MONGO_URI);

export const client = new MongoClient(uri, {
    maxIdleTimeMS: 30_000,
    socketTimeoutMS: 30_000,
    connectTimeoutMS: 150_000,
    maxConnecting: 400,
    maxPoolSize: 50,
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

export const db = client.db();