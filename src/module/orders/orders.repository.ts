import { ObjectId, type Collection, type Db } from 'mongodb'
import { BadRequestError } from '../../shared/errors'
import type { NewOrder, Order } from './orders.model'

export interface OrderStore {
    insert(order: NewOrder): Promise<Order>
    findById(id: string): Promise<Order | null>
    findAll(): Promise<Order[]>
}

interface OrderDocument {
    _id: ObjectId
    userId: ObjectId
    product: {
        _id: ObjectId
        name: string
        price: number
    }
    qty: number
    total: number
    status: 'placed'
    createdAt: Date
}

function toOrder(doc: OrderDocument): Order {
    return { 
        id: doc._id.toHexString(),
        userId: doc.userId.toHexString(),
        product: {
            id: doc.product._id.toHexString(),
            name: doc.product.name,
            price: doc.product.price
        },
        qty: doc.qty,
        total: doc.total,
        status: doc.status,
        createdAt: doc.createdAt
    }
}

function toObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) throw new BadRequestError('invalid id')
    return new ObjectId(id)
}

export class MongoOrderStore implements OrderStore {
    private readonly collection: Collection<OrderDocument>

    constructor(db: Db) {
        this.collection = db.collection<OrderDocument>('orders')
    }
    async insert(order: NewOrder): Promise<Order> {
        const doc: OrderDocument = { 
            _id: new ObjectId(), 
            userId: toObjectId(order.userId), 
            product: { _id: toObjectId(order.product.id), name: order.product.name, price: order.product.price }, 
            qty: order.qty, 
            total: order.total, 
            status: order.status, 
            createdAt: order.createdAt
        }
        await this.collection.insertOne(doc)
        return toOrder(doc)
    }
    async findById(id: string): Promise<Order | null> {
        const doc = await this.collection.findOne({ _id: toObjectId(id) })
        return doc ? toOrder(doc) : null
    }
    async findAll(): Promise<Order[]> {
        const docs = await this.collection
        .find()
        .sort({ createdAt: -1})
        .toArray()
        return docs.map(toOrder)
    }
}