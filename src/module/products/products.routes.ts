import { Router } from 'express'
import { Db } from 'mongodb'

// รับสิ่งที่ router ต้องใช้เข้ามาทาง parameter แล้วส่งมาจาก app.ts
// path ข้างในเริ่มจาก '/' เพราะ mount ไว้ที่ /products แล้ว
export function createProductsRouter(db: Db): Router {
  const router = Router()

  // TODO

  return router
}
