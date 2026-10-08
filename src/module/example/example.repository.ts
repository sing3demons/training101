import { ObjectId, type Collection, type Db } from 'mongodb'
import { BadRequestError } from '../../shared/errors'
import type { NewNote, Note } from './example.model'

// สิ่งที่ service ต้องการจาก "ที่เก็บข้อมูล" — service รู้จักแค่ interface นี้ ไม่รู้ว่าข้างหลังเป็น database อะไร
export interface NoteStore {
  insert(note: NewNote): Promise<Note>
  findById(id: string): Promise<Note | null>
  findAll(): Promise<Note[]>
}

// ---------- MongoDB ----------
// เรื่องของ MongoDB (ObjectId, _id, collection) อยู่ในไฟล์นี้ที่เดียว ไม่หลุดออกไปถึง service / handler

interface NoteDocument {
  _id: ObjectId
  title: string
  content: string
  createdAt: Date
}

function toNote({ _id, ...rest }: NoteDocument): Note {
  return { id: _id.toHexString(), ...rest }
}

function toObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) throw new BadRequestError('invalid id')
  return new ObjectId(id)
}

export class MongoNoteStore implements NoteStore {
  private readonly collection: Collection<NoteDocument>

  constructor(db: Db) {
    this.collection = db.collection<NoteDocument>('notes')
  }

  async insert(note: NewNote): Promise<Note> {
    const doc: NoteDocument = { _id: new ObjectId(), ...note }
    await this.collection.insertOne(doc)
    return toNote(doc)
  }

  async findById(id: string): Promise<Note | null> {
    const doc = await this.collection.findOne({ _id: toObjectId(id) })
    return doc ? toNote(doc) : null
  }

  async findAll(): Promise<Note[]> {
    const docs = await this.collection.find().sort({ createdAt: -1 }).toArray()
    return docs.map(toNote)
  }
}
