import { NotFoundError } from '../../shared/errors'
import type { Note } from './example.model'
import type { NoteStore } from './example.repository'

// logic ของ notes — รับ NoteStore เข้ามาทาง constructor และไม่รู้ว่าข้างหลังเป็น database อะไร
// ตอน test ส่งตัวปลอมที่ implements NoteStore เข้ามาแทนได้เลย
export class NoteService {
  constructor(private readonly store: NoteStore) {}

  async create(input: { title: string; content: string }): Promise<Note> {
    return this.store.insert({ ...input, createdAt: new Date() })
  }

  async getById(id: string): Promise<Note> {
    const note = await this.store.findById(id)
    if (!note) throw new NotFoundError('note not found')
    return note
  }

  async list(): Promise<Note[]> {
    return this.store.findAll()
  }
}
