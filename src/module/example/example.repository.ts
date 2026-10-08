import type { Collection, ObjectId } from 'mongodb'
import type { NewNote, Note } from './example.model'

// สิ่งที่ service ต้องการจาก "ที่เก็บข้อมูล" — service รู้จักแค่ interface นี้ ไม่รู้ว่าข้างหลังเป็น MongoDB
export interface NoteStore {
  insert(note: NewNote): Promise<Note>
  findById(id: ObjectId): Promise<Note | null>
  findAll(): Promise<Note[]>
}

// ตัวจริงที่คุยกับ MongoDB — รับ collection เข้ามาทาง constructor (ไม่ได้สร้าง connection เอง)
export class MongoNoteStore implements NoteStore {
  constructor(private readonly collection: Collection<NewNote>) {}

  async insert(note: NewNote): Promise<Note> {
    const result = await this.collection.insertOne({ ...note })
    return { _id: result.insertedId, ...note }
  }

  async findById(id: ObjectId): Promise<Note | null> {
    return this.collection.findOne({ _id: id })
  }

  async findAll(): Promise<Note[]> {
    return this.collection.find().sort({ createdAt: -1 }).toArray()
  }
}
