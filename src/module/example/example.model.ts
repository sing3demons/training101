import type { ObjectId } from 'mongodb'

// หน้าตา document ใน collection `notes`
export interface Note {
  _id: ObjectId
  title: string
  content: string
  createdAt: Date
}

export type NewNote = Omit<Note, '_id'>
