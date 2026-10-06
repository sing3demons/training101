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
    async update(filter, update) {
        const data = await this.collection.updateOne(filter, { $set: update })
        return data
    }

    async delete(id) {
        await this.collection.deleteOne({ _id: new ObjectId(id) });
    }
}

