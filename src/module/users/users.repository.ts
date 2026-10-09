import { Collection, Db, MongoServerError, ObjectId } from "mongodb"
import { User, NewUser } from "./users.model"
import { ConflictError, BadRequestError } from "../../shared/errors"

export interface UserStore {
    insert(user: NewUser): Promise<User>
    findById(id: string): Promise<User | null>
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

    async findById(id: string): Promise<User | null> {
        const doc = await this.collection.findOne({ _id: toObjectId(id) })
        return doc ? toUser(doc) : null
    }
}

function toUser({ _id, ...rest }: UserDocument ): User {
    return { id: _id.toHexString(), ...rest }
}

function toObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) throw new BadRequestError('invalid id')
        return new ObjectId(id)
}

export async function ensureUserIndexes(db: Db) {
    await db.collection('users').createIndex( {email: 1}, {unique: true} )
}

