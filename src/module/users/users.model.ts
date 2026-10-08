// model ของ user ไม้ผูกกับ database

export interface User {
    id: string
    name: string
    email: string
    createdAt: Date
}

export type NewUser = Omit<User, 'id'>