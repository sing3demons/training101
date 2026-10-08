import { MongoClient, type Db } from 'mongodb'
import { config } from './config'

const client = new MongoClient(config.mongoUri)

// เรียกครั้งเดียวตอนเริ่ม server แล้วส่ง Db ต่อให้ app.ts (ไม่มี global ให้ import ไปใช้ตรง ๆ)
export async function connectDb(): Promise<Db> {
  await client.connect()
  console.log(`MongoDB connected: ${config.mongoDb}`)
  return client.db(config.mongoDb)
}

export async function closeDb(): Promise<void> {
  await client.close()
}
