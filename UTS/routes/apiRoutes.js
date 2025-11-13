const express = require('express');
const { readJSON, writeJSON } = require('../utils/fileHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get cart
router.get('/cart', requireAuth, async (req, res) => {
  try {
    const carts = await readJSON('carts.json');
    const userCart = carts[req.session.user.id] || [];
    
    // Get product details for cart items
    const products = await readJSON('products.json');
    const cartWithDetails = userCart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { ...item, product } : null;
    }).filter(Boolean);
    
    res.json(cartWithDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to cart
router.post('/cart', requireAuth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const products = await readJSON('products.json');
    const product = products.find(p => p.id === parseInt(productId));
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    const carts = await readJSON('carts.json');
    const userId = req.session.user.id;
    const userCart = carts[userId] || [];
    
    // Check if product already in cart
    const existingItem = userCart.find(item => item.productId === parseInt(productId));
    
    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      userCart.push({
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        addedAt: new Date().toISOString()
      });
    }
    
    carts[userId] = userCart;
    await writeJSON('carts.json', carts);
    
    res.json({ success: true, cart: userCart });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update cart item quantity
router.put('/cart/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    const carts = await readJSON('carts.json');
    const userId = req.session.user.id;
    const userCart = carts[userId] || [];
    
    const item = userCart.find(item => item.productId === parseInt(productId));
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      carts[userId] = userCart.filter(item => item.productId !== parseInt(productId));
    } else {
      item.quantity = parseInt(quantity);
    }
    
    await writeJSON('carts.json', carts);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove from cart
router.delete('/cart/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const carts = await readJSON('carts.json');
    const userId = req.session.user.id;
    const userCart = carts[userId] || [];
    
    carts[userId] = userCart.filter(item => item.productId !== parseInt(productId));
    await writeJSON('carts.json', carts);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Create order
router.post('/orders', requireAuth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Shipping address and payment method are required' });
    }
    
    const carts = await readJSON('carts.json');
    const products = await readJSON('products.json');
    const orders = await readJSON('orders.json');
    
    const userId = req.session.user.id;
    const userCart = carts[userId] || [];
    
    if (userCart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Calculate total and verify stock
    let total = 0;
    const orderItems = [];
    
    for (const item of userCart) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
      
      total += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.imageUrl
      });
      
      // Update product stock
      product.stock -= item.quantity;
    }
    
    // Create order
    const newOrder = {
      id: Date.now(),
      userId,
      items: orderItems,
      total,
      shippingAddress,
      paymentMethod,
      status: 'processing',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    orders.push(newOrder);
    
    // Clear user cart
    carts[userId] = [];
    
    // Save all changes
    await writeJSON('orders.json', orders);
    await writeJSON('carts.json', carts);
    await writeJSON('products.json', products);
    
    res.json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const orders = await readJSON('orders.json');
    const userOrders = orders.filter(order => order.userId === req.session.user.id);
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;