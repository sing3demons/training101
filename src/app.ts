import express from 'express'
import type { Db } from 'mongodb'
import { ObjectId } from 'mongodb'
import { errorHandler, notFoundHandler } from './shared/error-handler'
import { NotFoundError } from './shared/errors'
import { createUserService, createUsersRouter } from './module/users/users.routes'
import { createProductsRouter } from './module/products/products.routes'
import { createOrdersRouter } from './module/orders/orders.routes'
import { createExampleRouter } from './module/example/example.routes'
import type { ProductCatalog, UserLookup } from './module/orders/orders.model'
import { MongoProductStore } from './module/products/products.repository'
import { ProductService } from './module/products/products.service'

// รับ db เข้ามา → ตอนเขียน test ส่ง db ทดสอบเข้ามาแทนได้
export function createApp(db: Db) {
  const app = express()

  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  const userLookup: UserLookup = {
    async getUserById(id: string) {
      if (!ObjectId.isValid(id)) {
        throw new NotFoundError('user not found')
      }
      const user = await db.collection('users').findOne({ _id: new ObjectId(id) })
      if (!user) {
        throw new NotFoundError('user not found')
      }
      return { id: user._id.toHexString() }
    },
  }

  const productStore = new MongoProductStore(db)
  const productService = new ProductService(productStore)

  const productCatalog: ProductCatalog = {
    async getProductById(id: string) {
      // getById ของเพื่อนจะ throw NotFoundError ให้เองถ้าไม่เจอ
      const product = await productService.getById(id)
      return {
        id: product.id,
        name: product.name,
        price: product.price,
      }
    },
    async decreaseStock(id: string, qty: number) {
      // decreaseStock ของเพื่อนจะตัด stock ใน MongoDB แบบ atomic และ throw ConflictError ให้ถ้าสต็อกไม่พอ
      await productService.decreaseStock(id, qty)
    },
    async increaseStock(id: string, qty: number) {
      // สำหรับคืนสต็อก (rollback) ในกรณี insert order ไม่สำเร็จ
      await db.collection('products').updateOne(
        { _id: new ObjectId(id) },
        { $inc: { stock: qty } }
      )
    },
  }

  const userService = createUserService(db)
  app.use('/users', createUsersRouter(userService))
  app.use('/products', createProductsRouter(db))
  app.use('/orders', createOrdersRouter(db, userLookup, productCatalog))
  app.use('/examples', createExampleRouter(db)) // ตัวอย่าง DI — ดู src/module/example

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
