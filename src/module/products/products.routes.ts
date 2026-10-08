import { Router } from 'express'
import { Db } from 'mongodb'
import { ProductHandler } from './products.handler'
import { MongoProductStore } from './products.repository'
import { ProductService } from './products.service'

// รับสิ่งที่ router ต้องใช้เข้ามาทาง parameter แล้วส่งมาจาก app.ts
// path ข้างในเริ่มจาก '/' เพราะ mount ไว้ที่ /products แล้ว
export function createProductsRouter(db: Db, productService?: ProductService): Router {
  const service = productService ?? new ProductService(new MongoProductStore(db))
  const handler = new ProductHandler(service)

  const router = Router()

  router.post('/', handler.create)
  router.get('/',handler.list)
  router.get('/:id',handler.getById)

  // TODO
  return router
}
export { ProductService, MongoProductStore}
