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

    app.post('/items', async (req, res) => await itemInstance.createItem(req, res));

    app.put('/items', (req, res) => itemInstance.updateItem(req, res));
    app.delete('/items', (req, res) => itemInstance.deleteItem(req, res));

    app.use((req, res) => {
        res.status(404).send('Not Found');
    });

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
    });
})()