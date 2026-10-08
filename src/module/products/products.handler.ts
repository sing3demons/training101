import { Request, Response } from 'express'
import { BadRequestError } from '../../shared/errors'
import type { ProductService } from './products.service'

export class ProductHandler{
    constructor(private readonly productService: ProductService){}
    create = async (req: Request, res: Response) => {
        const {name, price, stock, category } = req.body ?? {}
        if (typeof name !== 'string' || name.trim() === ''){
            throw new BadRequestError('name is required')
        }
        if (name.length > 200 ){
            throw new BadRequestError('name must be less than 200 characters')
        }
        if (typeof price !== 'number' || !Number.isInteger(price) || price < 0) {
            throw new BadRequestError('price must be a non-negative integer (satang)')
        }
        if (typeof stock !== 'number' || !Number.isInteger(stock) || stock <0){
            throw new BadRequestError('Stock must be a non-negative integer')
        }
        if (typeof category !== 'string' || category.trim() === ''){
            throw new BadRequestError('category is required')
        } 
        const product = await this.productService.create({
            name: name.trim(),
            price,
            stock,
            category: category.trim(),
        })
        res.status(201).json({data: product})
    }
    list = async (req: Request, res: Response) => {
        const hasMaliciousQuery = Object.keys(req.query).some(k => k.includes('[') || k.includes('$'))
        if (hasMaliciousQuery) {
            throw new BadRequestError('invalid query parameter')
        }

        const {category} = req.query
        if(category !== undefined && typeof category !== 'string'){
            throw new BadRequestError('category must be string')
        }
        const product = await this.productService.list(category?.trim())
        res.json({data: product })
    }

    getById = async (req: Request<{ id: string }>, res: Response) => {
        const product = await this.productService.getById(req.params.id)
        res.json({ data: product })
    }
}
