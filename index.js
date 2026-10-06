// const express = require('express');
import express from 'express';
import { Item } from './item.js';
import { connectDB } from './mongo.js';
import { Store } from './store.js';
const app = express();
const port = 3000;
app.use(express.json());


(async () => {
    const db = await connectDB()

    const store = new Store(db)
    const itemInstance = new Item(store);

    app.get('/items', async (req, res) => await itemInstance.getItems(req, res));

    app.post('/items', itemInstance.createItem);

    app.put('/items', itemInstance.updateItem);
    app.delete('/items', itemInstance.deleteItem);

    app.use((req, res) => {
        res.status(404).send('Not Found');
    });

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
    });
})()