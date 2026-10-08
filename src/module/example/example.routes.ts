import { Router } from 'express'
import type { Db } from 'mongodb'
import { NoteHandler } from './example.handler'
import { MongoNoteStore } from './example.repository'
import { NoteService } from './example.service'

// ประกอบ dependency ของ module ที่นี่: db → store → service → handler → router
// มีแค่ที่นี่ที่ใช้ `new` — class อื่นรับของที่ต้องใช้ผ่าน constructor อย่างเดียว
export function createExampleRouter(db: Db): Router {
  const store = new MongoNoteStore(db)
  const service = new NoteService(store)
  const handler = new NoteHandler(service)

  const router = Router()
  router.post('/', handler.create)
  router.get('/', handler.list)
  router.get('/:id', handler.getById)
  return router
}
