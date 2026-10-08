import { Router } from 'express'
import { Db } from 'mongodb'
import { MongoUserStore } from './users.repository'
import { UserService } from './users.service'
import { UserHandler } from './users.handler'

// รับสิ่งที่ router ต้องใช้เข้ามาทาง parameter แล้วส่งมาจาก app.ts
// path ข้างในเริ่มจาก '/' เพราะ mount ไว้ที่ /users แล้ว
export function createUsersRouter(db: Db): Router {
  const store = new MongoUserStore(db) 
  const service = new UserService(store)
  const handler = new UserHandler(service)

  const router = Router()
  router.post('/', handler.create)
  router.get('/:id', handler.getById)

  return router
}
