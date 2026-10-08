import type { ErrorRequestHandler, RequestHandler } from 'express'
import { AppError } from './errors'

// Response format ของ error ทั้งระบบ: { "error": { "message": "..." } }
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { message: err.message } })
    return
  }

  // JSON body ผิดรูปแบบ (express.json() parse ไม่ได้)
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { message: 'invalid JSON body' } })
    return
  }

  console.error(err)
  res.status(500).json({ error: { message: 'internal server error' } })
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: { message: `route not found: ${req.method} ${req.path}` } })
}
