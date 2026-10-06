
const items = [{
    id: "1",
    name: "test"
}
];

// {
//     id : "",
//     name: ""
// }

export class Item {
    constructor(store) {
        this.store = store;
    }

    async getItems(req, res) {
        const query = req.query
        // const data = items.filter((e) => e.name === query?.s)
        const data = await this.store.find(query);
        res.json(data);
    }

    createItem(req, res) {
        const newItem = req.body;
        items.push(newItem);
        res.status(201).json(newItem);
    }

    updateItem(req, res) {
        const updatedItem = req.body;
        const index = items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
            items[index] = updatedItem;
            res.json(updatedItem);
        } else {
            res.status(404).send('Item not found');
        }
    }

    deleteItem(req, res) {
        const { id } = req.body;
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            const deletedItem = items.splice(index, 1);
            res.json(deletedItem);
        } else {
            res.status(404).send('Item not found');
        }
    }
}