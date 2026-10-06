import { Collection, Db, ObjectId } from 'mongodb'

export interface IStore {
    find(filter: any): Promise<any>
    update(filter: any, update: any): Promise<any>
    delete(id: string): Promise<any>
    create(data: any): Promise<any>
}

export class Store implements IStore {
    private readonly db: Db
    private readonly collection: Collection

    constructor(db: Db) {
        this.db = db;
        const collection = db.collection('documents');
        this.collection = collection
    }

    async find(filter: any) {
        const data = this.collection.find({})
        return await data.toArray()
    }
    async update(filter: any, update: any) {
        const data = await this.collection.updateOne(filter, { $set: update })
        return data
    }

    async delete(id: string) {
        await this.collection.deleteOne({ _id: new ObjectId(id) });
    }

    async create(data: any) {
        const result = await this.collection.insertOne(data);
        return { ...data, _id: result.insertedId };
    }

}

