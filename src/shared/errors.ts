// throw error เหล่านี้จากที่ไหนก็ได้ แล้ว error-handler จะแปลงเป็น HTTP response ให้เอง
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = new.target.name
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'bad request') {
    super(400, message)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'not found') {
    super(404, message)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'conflict') {
    super(409, message)
  }
}
