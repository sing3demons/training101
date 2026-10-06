import type { IStore } from "./store";
import type { Request, Response } from 'express'


export class Item {
    private readonly store: IStore
    constructor(store: IStore) {
        this.store = store;
    }

    async getItems(req: Request, res: Response) {
        // const query = req.query as Recode<string, string>
        // const data = items.filter((e) => e.name === query?.s)
        const data = await this.store.find();
        res.json(data);
    }

    async createItem(req: Request, res: Response) {
        const newItem = req.body;
        const result = await this.store.create(newItem);
        res.status(201).json(result);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }

    async updateItem(req: Request, res: Response) {
        try {
            const { id, ...data } = req.body; // ดึง id และข้อมูลที่จะอัปเดต                             
            const result = await this.store.update(id, data);

            if (result.matchedCount > 0) {
                res.json({ message: 'Item updated successfully', id, ...data });
            } else {
                res.status(404).send('Item not found');
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async deleteItem(req: Request, res: Response) {
        try {
            const { id } = req.body;
            const result = await this.store.delete(id);

            if (result.deletedCount > 0) {
                res.json({ message: 'Item deleted successfully', id });
            } else {
                res.status(404).send('Item not found');
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}