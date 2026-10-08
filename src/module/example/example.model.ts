// model ของระบบ — ไม่ผูกกับ database ใด ๆ (ไม่มี ObjectId / ไม่ import mongodb)
export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
}

export type NewNote = Omit<Note, 'id'>
