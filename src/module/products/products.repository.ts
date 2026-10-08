import {ObjectId, type Collection, type Db } from 'mongodb'
import { BadRequestError } from '../../shared/errors'
import type { NewProduct, Product } from './products.model'

export interface ProductStore {
    insert(product: NewProduct): Promise<Product>
    findById(id: string): Promise<Product | null>
    findAll(category?: string): Promise<Product[]>
    decreaseStock(id: string, qty: number): Promise<'ok' | 'not_found' | 'insufficient_stock'>
}
interface ProductDocument {
    _id: ObjectId
    name: string
    price: number
    stock: number
    category: string
    createdAt: Date
}
function toProduct({ _id, ...rest }: ProductDocument):
Product {
    return { id: _id.toHexString(), ...rest}
}
function toObjectId(id: string) : ObjectId {
    if (!ObjectId.isValid(id)){
        throw new BadRequestError('invalid id')
    }
    return new ObjectId(id)
}
function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
} 
export class MongoProductStore implements ProductStore{
    private readonly collection: Collection<ProductDocument>
    constructor(db: Db){
        this.collection = db.collection<ProductDocument>('products')
    }
    async insert(product: NewProduct): Promise<Product>{
        const doc: ProductDocument = {_id: new ObjectId(), ...product }
        await this.collection.insertOne(doc)
        return toProduct(doc)
    }
    async findById(id: string): Promise<Product | null> {
        const doc = await this.collection.findOne({ _id: toObjectId(id)})
        return doc ? toProduct(doc) : null
    }
    async findAll(category?: string): Promise<Product[]>{
        const filter = category ? { category : {$regex: new RegExp(`^${escapeRegex(category)}$`,'i')}} : {}
        const doc = await this.collection
        .find(filter)
        .sort({ createdAt: -1})
        .toArray()
        return doc.map(toProduct)
    }
    async decreaseStock(id: string, qty: number): Promise<'ok' | 'not_found' | 'insufficient_stock'>{
        const objectId = toObjectId(id)
        const res = await this.collection.updateOne(
            {_id: objectId, stock: {$gte: qty}},
            {$inc: {stock: -qty}},
        )
        if (res.modifiedCount === 1) return 'ok'
        const doc = await this.collection.findOne({ _id: objectId})
        if (!doc) return 'not_found'
        return 'insufficient_stock'
    }
}