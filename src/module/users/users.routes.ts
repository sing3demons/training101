import { Router } from 'express'
import { Db } from 'mongodb'
import { MongoUserStore } from './users.repository'
import { UserService } from './users.service'
import { UserHandler } from './users.handler'

// รับสิ่งที่ router ต้องใช้เข้ามาทาง parameter แล้วส่งมาจาก app.ts
// path ข้างในเริ่มจาก '/' เพราะ mount ไว้ที่ /users แล้ว
export function createUserService(db: Db) {
  const store = new MongoUserStore(db) 
  return new UserService(store)
}

export function createUsersRouter(userService: UserService): Router {
  const handler = new UserHandler(userService)

  const router = Router()
  router.post('/', handler.create)
  router.get('/:id', handler.getById)

  return router
}
