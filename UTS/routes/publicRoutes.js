const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// Get all products
router.get('/products', async (req, res) => {
  try {
    const db = getDB();
    const { category, search } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const products = await db.collection('products').find(query).toArray();
    res.json(products);
  } catch (error) {
    console.error('API products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product
router.get('/product/:id', async (req, res) => {
  try {
    const db = getDB();
    const product = await db.collection('products').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('API product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get cart (requires auth)
router.get('/cart', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.session.user.id;
    
    const cart = await db.collection('carts').findOne({ userId }) || { items: [] };
    res.json(cart.items);
  } catch (error) {
    console.error('API cart get error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to cart (requires auth)
router.post('/cart', requireAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const db = getDB();
    const userId = req.session.user.id;
    
    // Verify product exists
    const product = await db.collection('products').findOne({
      _id: new ObjectId(productId)
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get or create cart
    let cart = await db.collection('carts').findOne({ userId });
    
    if (!cart) {
      cart = { userId, items: [] };
    }
    
    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId
    );
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({ productId, quantity: quantity || 1 });
    }
    
    // Update cart in database
    await db.collection('carts').updateOne(
      { userId },
      { $set: { items: cart.items, updatedAt: new Date() } },
      { upsert: true }
    );
    
    res.json({ message: 'Added to cart', items: cart.items });
  } catch (error) {
    console.error('API cart add error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart quantity (requires auth)
router.patch('/cart', requireAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const db = getDB();
    const userId = req.session.user.id;
    
    const cart = await db.collection('carts').findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    if (quantity <= 0) {
      // Remove item
      cart.items = cart.items.filter(item => item.productId !== productId);
    } else {
      // Update quantity
      const item = cart.items.find(item => item.productId === productId);
      if (!item) {
        return res.status(404).json({ error: 'Item not in cart' });
      }
      item.quantity = quantity;
    }
    
    await db.collection('carts').updateOne(
      { userId },
      { $set: { items: cart.items, updatedAt: new Date() } }
    );
    
    res.json({ message: 'Cart updated', items: cart.items });
  } catch (error) {
    console.error('API cart update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove from cart (requires auth)
router.delete('/cart/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const db = getDB();
    const userId = req.session.user.id;
    
    await db.collection('carts').updateOne(
      { userId },
      { $pull: { items: { productId } }, $set: { updatedAt: new Date() } }
    );
    
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('API cart remove error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get orders (requires auth)
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.session.user.id;
    
    const orders = await db.collection('orders')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(orders);
  } catch (error) {
    console.error('API orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order / Checkout (requires auth)
router.post('/orders', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.session.user.id;
    
    // Get cart
    const cart = await db.collection('carts').findOne({ userId });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Get product details
    const productIds = cart.items.map(item => new ObjectId(item.productId));
    const products = await db.collection('products').find({
      _id: { $in: productIds }
    }).toArray();
    
    // Build order items
    const orderItems = cart.items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.imageUrl
      };
    });
    
    const total = orderItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );
    
    // Create order
    const order = {
      userId,
      userEmail: req.session.user.email,
      userName: req.session.user.name,
      items: orderItems,
      total,
      status: 'pending',
      createdAt: new Date()
    };
    
    const result = await db.collection('orders').insertOne(order);
    
    // Clear cart
    await db.collection('carts').updateOne(
      { userId },
      { $set: { items: [], updatedAt: new Date() } }
    );
    
    res.status(201).json({ 
      id: result.insertedId,
      ...order 
    });
  } catch (error) {
    console.error('API order create error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;