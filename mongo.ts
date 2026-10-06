import { MongoClient } from 'mongodb'

export async function connectDB() {
    const url = process.env.MONGO_URL || '127'
    const client = new MongoClient(url);

    // Database Name
    const dbName = 'myProject';
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
  
    return db;
}