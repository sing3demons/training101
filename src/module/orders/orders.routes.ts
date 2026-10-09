import { Router } from 'express'
import type { Db } from 'mongodb'
import { OrderHandler } from './orders.handler'
import { MongoOrderStore } from './orders.repository'
import { OrderService } from './orders.service'
import type { ProductCatalog, UserLookup } from './orders.model'

// รับสิ่งที่ router ต้องใช้เข้ามาทาง parameter แล้วส่งมาจาก app.ts
// path ข้างในเริ่มจาก '/' เพราะ mount ไว้ที่ /orders แล้ว
export function createOrdersRouter(
  db: Db, 
  userLookup: UserLookup, 
  productCatalog: ProductCatalog
): Router {
  const store = new MongoOrderStore(db)
  const service = new OrderService(store, userLookup, productCatalog)
  const handler = new OrderHandler(service)

  const router = Router()
  router.post('/', handler.create)
  router.get('/', handler.list)
  router.get('/:id', handler.getById)
  
  return router
}
