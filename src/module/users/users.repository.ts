import { Collection, Db, MongoServerError, ObjectId } from "mongodb"
import { User, NewUser } from "./users.model"
import { ConflictError } from "../../shared/errors"

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
        const DUPLLICATE_KEY_ERROR = 11000
        try {
            await this.collection.insertOne(doc)
        } catch (err) {
            if ( err instanceof MongoServerError && err.code === DUPLLICATE_KEY_ERROR ) throw new ConflictError('email already exists')
            throw err
        }
        return toUser(doc)
    }
}

function toUser({ _id, ...rest }: UserDocument ): User {
    return { id: _id.toHexString(), ...rest }
}

export async function ensureUserIndexes(db: Db) {
    await db.collection('users').createIndex( {email: 1}, {unique: true} )
}

