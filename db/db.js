const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)


let next_shop_id = 0
const make_shop = (name) => ({id: next_shop_id++, name})

let next_product_id = 0
const make_product = (shop_id, name, price) => ({id: next_product_id++, shop_id, name, price})


const make_order = (shop_id) => db.get('orders')
    .push({id: next_order_id++, shop_id})
    .write() 


let next_lineItem_id = 0
const make_lineItem = (product_id, order_id, amount) => db.get('line_items')
    .push({id: next_lineItem_id++, product_id, order_id, amount})
    .write() 


const cheese_shop = make_shop('The Cheese Shop')
const mystery_shop = make_shop('Tina\'s Mystery Shop')

/*
Shop
id 
name 

Product 
id 
shop_id
name 

// line item maps the product to the order  
// like a join table 
Line Item 
id 
product_id
order_id 
quantity 
amount 

Order
id
shop_id
*/

// list of cheese shop products 
const cheese_shop_products = [
    make_product(cheese_shop.id, 'Cheddar 1 1lbs',  6.50),
    make_product(cheese_shop.id, 'Brie 1 1lbs',  4.50),
    make_product(cheese_shop.id, 'Swiss 1 1lbs',  5.50)
]

// list of mystery shop products 
const mystery_shop_products = [
    make_product(mystery_shop.id, 'X', 200.00),
    make_product(mystery_shop.id, 'Y', 2000.00),
    make_product(mystery_shop.id, 'Z', 2.00)
]

// Set some defaults (required if your JSON file is empty)
db.defaults({ 
    next_id: {
        shops: next_shop_id,
        products: next_product_id,
        orders: 0,
        line_items: 0,
    },
    shops: [cheese_shop, mystery_shop], 
    products: [...cheese_shop_products, ...mystery_shop_products], 
    orders: [],
    line_items: []
}).write()

module.exports = db



