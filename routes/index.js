const express = require('express')
const body_parser = require('body-parser')
const db = require('../db/db')
const _ = require('lodash')
const app = express()
app.use(body_parser.json())
app.use(body_parser.urlencoded({extended: true}))


// get the list of shops
app.get('/', (req, res) => {
    res.send('Welcomeeeeeee')
})

// get the list of shops
app.get('/shops', (req, res) => {
    const shops = db.get('shops')
    
    res.json(shops.value())
})

// get the products 
app.get('/products', (req, res) => {
    products = db.get('products')
    res.json(products.value())
})

// get the products by shop
app.get('/products-by-shop/:shop', (req, res) => {
    const shop_id = Number(req.params.shop)
    products = db.get('products')

    // if the shop_id is undefined, return all products 
    if (shop_id == undefined) {
        res.json(products.value())
    } else {
        // filter for the products based on shop_id, and return products 
        // from those stores
        const products_for_shop = products
            .filter(p => p.shop_id === shop_id)
        
        res.json(products_for_shop.value())
    } 
})

// get line items
app.get('/line-items', (req, res) => {
    const line_item = db.get('line_items')
    res.json(line_item.value())
})

// get line items by product 
app.get('/line-items-by-product/:product', (req, res) => {
    const product_id = Number(req.params.product)
    const line_items = db.get('line_items')

    const line_items_for_product = line_items 
        .filter(i => i.product_id === product_id)

    res.json(line_items_for_product.value())
})

// get line items by order 
app.get('/line-items-by-order/:order', (req, res) => {
    const order_id = Number(req.params.order)
    const line_items = db.get('line_items')

    const line_items_for_order = line_items 
        .filter(i => i.order_id === order_id)

    res.json(line_items_for_order.value())
})

// get order 
app.get('/orders', (req, res) => {
    const order = db.get('orders')
    res.json(order.value())
})

// get order descriptions - receipt 
app.get('/orders-description/:order', (req, res) => {
    const order_id = Number(req.params.order)

    const order = db.get('orders').find({id: order_id}).value()
    const shop = db.get('shops').find({id: order.shop_id}).value()
    const line_items = db.get('line_items').filter( i => i.order_id === order_id).value()
    const products = db.get('products')

    const line_items_with_info = 
    line_items.map(({ product_id, amount }) => {
        const product = products.find({ id:product_id }).value()
        
        return {
            name: product.name,
            price: product.price,
            amount,
            actual_price: product.price * amount
        }
    })

    const line_item_description = 
    line_items_with_info.map(({ name, amount , price, actual_price}) => 
        `${ name } Qty: ${ amount }` + '\n' +
        `$${ price.toFixed(2) } x ${ amount } = $${actual_price.toFixed(2)}`
    )

    const total = line_items_with_info.reduce((price, item) => price + item.actual_price, 0)

const description = 
`Shop:${shop.name}
Order #${order_id}

----------

${line_item_description.join('\n\n')}

----------
    
    Total: $${total.toFixed(2)}
    `
    res.end(description)
})

// POST - MAKE order
// Warning!!! lowdb doesn't have transactions. 
app.post('/orders', (req, res) => {
    const { shop, items } = req.body

    // null checks 
    if (shop == null || items == null || items.constructor !== Array) {
        res.status(500)
        return
    }

    const shop_id = Number(shop)
    const order_id = db.get('next_id.orders').value()
    let line_item_id = db.get('next_id.line_items').value()

    // create and write the order to database 
    db.get('orders')
        .push({
            id: order_id, 
            shop_id
        })
    .write()

    // create and write the line items 
    for(let i = 0; i < items.length; i++) {
        const item = items[i]
        
        db.get('line_items')
            .push({
                id: line_item_id++,
                product_id: Number(item.product),
                order_id, 
                amount: Number(item.amount)
            })
        .write()
    }

    db.set('next_id.orders', order_id + 1).write()
    db.set('next_id.line_items', line_item_id).write()

})

app.listen(3000, () => {
    console.log('server started')
})


