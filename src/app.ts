import express from 'express'
import type { Db } from 'mongodb'
import { errorHandler, notFoundHandler } from './shared/error-handler'
import { createUsersRouter } from './module/users/users.routes'
import { createProductsRouter } from './module/products/products.routes'
import { createOrdersRouter } from './module/orders/orders.routes'
import { createExampleRouter } from './module/example/example.routes'

// รับ db เข้ามา → ตอนเขียน test ส่ง db ทดสอบเข้ามาแทนได้
export function createApp(db: Db) {
  const app = express()

  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/users', createUsersRouter(db))
  app.use('/products', createProductsRouter(db))
  app.use('/orders', createOrdersRouter(db))
  app.use('/examples', createExampleRouter(db)) // ตัวอย่าง DI — ดู src/module/example

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
