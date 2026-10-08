import type { Request, Response } from 'express'
import { BadRequestError } from '../../shared/errors'
import type { NoteService } from './example.service'

// แปลง HTTP ↔ service — รับ NoteService เข้ามาทาง constructor
export class NoteHandler {
  constructor(private readonly noteService: NoteService) {}

  // ใช้ arrow function เพื่อให้ส่ง method ไปให้ router ได้ตรง ๆ โดย `this` ไม่หาย
  create = async (req: Request, res: Response) => {
    const { title, content } = req.body ?? {}
    if (typeof title !== 'string' || title.trim() === '') throw new BadRequestError('title is required')
    if (typeof content !== 'string') throw new BadRequestError('content must be a string')

    const note = await this.noteService.create({ title: title.trim(), content })
    res.status(201).json({ data: note })
  }

  getById = async (req: Request<{ id: string }>, res: Response) => {
    const note = await this.noteService.getById(req.params.id)
    res.json({ data: note })
  }

  list = async (_req: Request, res: Response) => {
    const notes = await this.noteService.list()
    res.json({ data: notes })
  }
}
