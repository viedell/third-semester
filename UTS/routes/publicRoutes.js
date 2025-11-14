const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getProducts, getOrders } = require('../utils/database');
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
    const products = await getProducts();
    const featuredProducts = products.slice(0, 6);
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
    let products = await getProducts();
    
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
    const product = await findProductById(req.params.id);
    
    if (!product) {
      return res.status(404).send('Product not found');
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
    const orders = await getOrders(req.session.user.id);
    res.send(ordersView({ 
      orders: orders,
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