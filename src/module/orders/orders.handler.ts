import type { Request, Response } from 'express'
import { BadRequestError } from '../../shared/errors'
import type { OrderService } from './orders.service'
import { z } from 'zod'

const objectIdRegex = /^[0-9a-fA-F]{24}$/

const createOrderSchema = z.object({
    userId: z.string().trim().min(1, 'userId is required').regex(objectIdRegex, 'invalid userId'),
    productId: z.string().trim().min(1, 'productId is required').regex(objectIdRegex, 'invalid productId'),
    qty: z.number().int().positive('qty must be a positive integer')
})

export class OrderHandler {
    constructor(private readonly orderService: OrderService) {}

    create = async (req: Request, res: Response): Promise<void> => {
        const result = createOrderSchema.safeParse(req.body)

        if (!result.success) {
            const firstErrorMessage = result.error.issues[0]?.message ?? 'Invalid request body'
            throw new BadRequestError(firstErrorMessage)
        }

        const order = await this.orderService.create(result.data)
        res.status(201).json({ data: order })
    }

    getById = async (req: Request<{ id: string }>, res: Response) => {
        const order = await this.orderService.getById(req.params.id)
        res.json({ data: order })
    }  

    list = async (_req: Request, res: Response) => {
        const orders = await this.orderService.list()
        res.json({ data: orders })
    }
}