import type { UserService } from "./users.service"
import type { Request, Response } from 'express'
import { BadRequestError } from "../../shared/errors"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class UserHandler {
    constructor(private readonly userService: UserService) {}

    create = async (req: Request, res: Response) => {
        const { name, email } = req.body ?? {}
        if (typeof name !== 'string') throw new BadRequestError('name is required')
        const trimmedName = name.trim()
        if (trimmedName === '') throw new BadRequestError('name is required')
        if (trimmedName.length > 100) throw new BadRequestError('name must be at most 100 characters')
        if (typeof email !== 'string') throw new BadRequestError('email is required')
        const trimmedEmail = email.trim()
        if (!EMAIL_REGEX.test(trimmedEmail)) throw new BadRequestError('email is invalid')

        const user = await this.userService.create({ name: trimmedName, email: trimmedEmail })
        res.status(201).json({ data: user })
    }

    getById = async (req: Request<{ id: string}>, res: Response) => {
        const user = await this.userService.getUserById(req.params.id)
        res.json({ data: user })
    }
}