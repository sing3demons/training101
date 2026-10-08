import express from 'express'
import type { Db } from 'mongodb'
import { ObjectId } from 'mongodb'
import { errorHandler, notFoundHandler } from './shared/error-handler'
import { BadRequestError, ConflictError, NotFoundError } from './shared/errors'
import { createUsersRouter } from './module/users/users.routes'
import { createProductsRouter } from './module/products/products.routes'
import { createOrdersRouter } from './module/orders/orders.routes'
import { createExampleRouter } from './module/example/example.routes'
import type { ProductCatalog, UserLookup } from './module/orders/orders.model'

// รับ db เข้ามา → ตอนเขียน test ส่ง db ทดสอบเข้ามาแทนได้
export function createApp(db: Db) {
  const app = express()

  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  const mockUserLookup: UserLookup = {
    async getUserById(id: string) {
      if (!ObjectId.isValid(id)) throw new BadRequestError('invalid user id')
      if (id === '000000000000000000000001') throw new NotFoundError('user not found')
      return { id }
    }
  }

  let mockStock = 3

  const mockProductCatalog: ProductCatalog = {
    async getProductById(id: string) {
      if (!ObjectId.isValid(id)) throw new BadRequestError('invalid product id')
      if (id === '000000000000000000000001') throw new NotFoundError('product not found')
      return { id, name: 'Keyboard', price: 159000 }
    },
    async decreaseStock(id: string, qty: number) {
      if (!ObjectId.isValid(id)) throw new BadRequestError('invalid product id')
      if (mockStock < qty) {throw new ConflictError('insufficient stock')}
      mockStock -= qty
    }
  }

  app.use('/users', createUsersRouter(db))
  app.use('/products', createProductsRouter(db))
  app.use('/orders', createOrdersRouter(db, mockUserLookup, mockProductCatalog))
  app.use('/examples', createExampleRouter(db)) // ตัวอย่าง DI — ดู src/module/example

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
