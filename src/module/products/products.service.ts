import { BadRequestError, ConflictError, NotFoundError } from "../../shared/errors";
import type { NewProduct, Product } from "./products.model";
import type { ProductStore } from "./products.repository";

export interface CreateProductInput{
    name: string 
    price: number
    stock: number
    category: string

}
export class ProductService {
    constructor(private readonly store: ProductStore){}
    async create(input: CreateProductInput): Promise<Product>{
        const newProduct: NewProduct = {
            ...input,
            createdAt: new Date(),
        }
        return this.store.insert(newProduct)
    }
    async list(category?: string): Promise<Product[]>{
        return this.store.findAll(category)
    }
    async getById(id: string): Promise<Product>{
        const product = await this.store.findById(id)
        if (!product){
            throw new NotFoundError('product not found')
        }
        return product 
    }
    async decreaseStock(id: string, qty: number): Promise<void>{
        if (qty <= 0 || !Number.isInteger(qty)){
            throw new BadRequestError('quanty must be a pasitive integer')
        }
        const result = await this.store.decreaseStock(id, qty)
        if (result === 'not_found'){
            throw new NotFoundError('product not found')
        }
        if (result === 'insufficient_stock'){
            throw new ConflictError('insufficient stock')
        }
    }
}