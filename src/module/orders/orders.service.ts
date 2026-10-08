import { NotFoundError } from '../../shared/errors'
import type { Order, ProductCatalog, UserLookup } from './orders.model'
import type { OrderStore } from './orders.repository'

export class OrderService {
    constructor(
        private readonly store: OrderStore,
        private readonly userLookup: UserLookup,
        private readonly productCatalog: ProductCatalog
    ) {}

    async create(input: { userId: string; productId: string; qty: number }): Promise<Order> {
        await this.userLookup.getUserById(input.userId); // ตรวจสอบว่ามี userId นี้อยู่จริงหรือไม่

        const product = await this.productCatalog.getProductById(input.productId);
        await this.productCatalog.getProductById(input.productId); // ตรวจสอบว่ามี productId นี้อยู่จริงหรือไม่
        await this.productCatalog.decreaseStock(input.productId, input.qty); // ลด stock ของ product

        const total = product.price * input.qty;

        return await this.store.insert({
            userId: input.userId,
            product: {
                id: product.id,
                name: product.name,
                price: product.price
            },
            qty: input.qty,
            total: total,
            status: 'placed',
            createdAt: new Date()
        });
    }
    async getById(id: string): Promise<Order> {
        const order = await this.store.findById(id)
        if (!order) throw new NotFoundError('order not found')
        return order
    }

    async list(): Promise<Order[]> {
        return this.store.findAll()
    }
}