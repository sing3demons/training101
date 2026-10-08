import { Collection, Db, ObjectId } from "mongodb"
import { User, NewUser } from "./users.model"

export interface UserStore {
    insert(user: NewUser): Promise<User>
}

// ------ MongoDB ---------

interface UserDocument {
    _id: ObjectId
    name: string
    email: string
    createdAt: Date
}

export class MongoUserStore implements UserStore {
    private readonly collection: Collection<UserDocument>

    constructor(db: Db) {
        this.collection = db.collection<UserDocument>('users')
    }

    async insert(user: NewUser): Promise<User> {
        const doc: UserDocument  = { _id: new ObjectId(), ...user }
        await this.collection.insertOne(doc)
        return toUser(doc)
    }
}

function toUser({ _id, ...rest }: UserDocument ): User {
    return { id: _id.toHexString(), ...rest }
}

