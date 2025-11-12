const express = require('express');
const router = express.Router();
const { readJSON } = require('../utils/fileHandler');
const { homeView } = require('../views/home');
const { productsView } = require('../views/products');
const { productView } = require('../views/product');
const { cartView } = require('../views/cart');
const { ordersView } = require('../views/orders');

// Home page
router.get('/', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    res.send(homeView(products));
  } catch (error) {
    res.status(500).send('<h1>Server Error</h1>');
  }
});

// Products listing
router.get('/products', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    res.send(productsView(products));
  } catch (error) {
    res.status(500).send('<h1>Server Error</h1>');
  }
});

// Single product page
router.get('/product/:id', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
      return res.status(404).send('<h1>Product Not Found</h1>');
    }
    
    res.send(productView(product));
  } catch (error) {
    res.status(500).send('<h1>Server Error</h1>');
  }
});

// Cart page
router.get('/cart', async (req, res) => {
  try {
    const cart = await readJSON('cart.json');
    const products = await readJSON('products.json');
    
    const cartItems = cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return { ...item, product };
    });
    
    const total = cartItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    
    res.send(cartView(cartItems, total));
  } catch (error) {
    res.status(500).send('<h1>Server Error</h1>');
  }
});

// Orders page
router.get('/orders', async (req, res) => {
  try {
    const orders = await readJSON('orders.json');
    res.send(ordersView(orders));
  } catch (error) {
    res.status(500).send('<h1>Server Error</h1>');
  }
});

module.exports = router;