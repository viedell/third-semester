const express = require('express');
const { readJSON } = require('../utils/fileHandler');
const { requireAuth } = require('../middleware/auth');
const homeView = require('../views/home');
const productsView = require('../views/products');
const productView = require('../views/product');
const cartView = require('../views/cart');
const ordersView = require('../views/orders');
const profileView = require('../views/profile');

const router = express.Router();

// Home page
router.get('/', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    const featuredProducts = Array.isArray(products) ? products.slice(0, 6) : [];
    res.send(homeView({ 
      featuredProducts, 
      user: req.session.user 
    }));
  } catch (error) {
    console.error('Home page error:', error);
    res.send(homeView({ 
      featuredProducts: [], 
      user: req.session.user 
    }));
  }
});

// Products page
router.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let products = await readJSON('products.json');
    
    if (!Array.isArray(products)) {
      products = [];
    }
    
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    }
    
    res.send(productsView({ 
      products, 
      category, 
      search,
      user: req.session.user 
    }));
  } catch (error) {
    console.error('Products page error:', error);
    res.send(productsView({ 
      products: [], 
      category: null, 
      search: null,
      user: req.session.user 
    }));
  }
});

// Single product page
router.get('/products/:id', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    const product = Array.isArray(products) ? products.find(p => p.id === parseInt(req.params.id)) : null;
    
    if (!product) {
      return res.status(404).send(`
        <html>
          <body style="background: #0a0a0a; color: white; text-align: center; padding: 4rem; font-family: sans-serif;">
            <h1>Product Not Found</h1>
            <p>The product you're looking for doesn't exist.</p>
            <a href="/products" style="color: #ff2d55;">Back to Products</a>
          </body>
        </html>
      `);
    }
    
    res.send(productView({ 
      product, 
      user: req.session.user 
    }));
  } catch (error) {
    console.error('Product page error:', error);
    res.status(500).send('Server error');
  }
});

// Cart page (protected)
router.get('/cart', requireAuth, async (req, res) => {
  res.send(cartView({ 
    user: req.session.user 
  }));
});

// Orders page (protected)
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const orders = await readJSON('orders.json');
    const userOrders = Array.isArray(orders) ? orders.filter(order => order.userId === req.session.user.id) : [];
    
    res.send(ordersView({ 
      orders: userOrders,
      user: req.session.user 
    }));
  } catch (error) {
    console.error('Orders page error:', error);
    res.send(ordersView({ 
      orders: [],
      user: req.session.user 
    }));
  }
});

// Profile page (protected)
router.get('/profile', requireAuth, (req, res) => {
  res.send(profileView({ 
    user: req.session.user,
    error: null,
    success: null
  }));
});

module.exports = router;