import { ObjectId } from 'mongodb'
import type { NewNote, Note } from './example.model'
import type { NoteStore } from './example.repository'

// ตัวปลอมของ NoteStore เก็บข้อมูลใน memory — ใช้แทน MongoNoteStore ได้ทันทีเพราะ implements interface เดียวกัน
// ใช้ตอน test หรือตอนที่ของจริงยังไม่เสร็จ:  new NoteService(new InMemoryNoteStore())
export class InMemoryNoteStore implements NoteStore {
  private readonly notes: Note[] = []

  async insert(note: NewNote): Promise<Note> {
    const saved = { _id: new ObjectId(), ...note }
    this.notes.push(saved)
    return saved
  }

  async findById(id: ObjectId): Promise<Note | null> {
    return this.notes.find((note) => note._id.equals(id)) ?? null
  }

  async findAll(): Promise<Note[]> {
    return [...this.notes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
}
