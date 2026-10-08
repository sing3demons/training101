export interface OrderProduct {
    id: string
    name: string
    price: number
}

export interface Order {
    id: string
    userId: string
    product: OrderProduct
    qty: number
    total: number
    status: 'placed'
    createdAt: Date
}

export type NewOrder = Omit<Order, 'id' >

export interface UserLookup {
    getUserById(id: string): Promise<{ id: string }>
}

export interface ProductCatalog {
    getProductById(id: string): Promise<{ id: string; name: string; price: number }>
    decreaseStock(id: string, qty: number): Promise<void>
}