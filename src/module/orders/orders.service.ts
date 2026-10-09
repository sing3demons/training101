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
        // ตรวจสอบว่ามี userId นี้อยู่จริงหรือไม่
        await this.userLookup.getUserById(input.userId);

        // ตรวจสอบข้อมูลสินค้าและราคา
        const product = await this.productCatalog.getProductById(input.productId);
        
        // ลด stock ของสินค้า
        await this.productCatalog.decreaseStock(input.productId, input.qty);

        const total = product.price * input.qty;

        // บันทึก order พร้อมดักจับข้อผิดพลาดเพื่อคืนสต็อก (Rollback)
        try {
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
        } catch (error) {
            // คืนสต็อกทันทีหากบันทึกลง Database ไม่สำเร็จ
            await this.productCatalog.increaseStock(input.productId, input.qty);
            throw error;
        }
    }

    async getById(id: string): Promise<Order> {
        const order = await this.store.findById(id);
        if (!order) throw new NotFoundError('order not found');
        return order;
    }

    async list(): Promise<Order[]> {
        return this.store.findAll();
    }
}