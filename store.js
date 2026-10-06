import { Db } from 'mongodb'

export class Store {
    constructor(db) {
        this.db = db;
        const collection = db.collection('documents');
        this.collection = collection
    }

    async find() {
        const data = await this.collection.find({})
        return data.toArray()
    }

    async delete(id) {
        await this.collection.deleteOne({ _id: new ObjectId(id) });
    }
}

