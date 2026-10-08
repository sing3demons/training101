import type { User } from './users.model'
import type { UserStore } from './users.repository'
import { NotFoundError } from '../../shared/errors'


export class UserService {
    constructor(private readonly store: UserStore ) {}

    async create(input: { name: string; email: string }): Promise<User> {
        const email = input.email.trim().toLowerCase()  //กฎของ email ที่ตัวเล็กเสมอ
        return this.store.insert({ ...input, email, createdAt: new Date() }) //เติม createdAt แล้วส่งให้ store
    }
    // Promise คือ สัญญาว่าจะได้ user ในอนาคตระหว่างรอ database ไปทำงาน
    async getUserById(id: string): Promise<User> {  
        const user = await this.store.findById(id)
        if (!user) throw new NotFoundError('user not found')
        return user
    }

}