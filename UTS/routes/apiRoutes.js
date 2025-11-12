const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../utils/fileHandler');

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product
router.get('/product/:id', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new product
router.post('/products', async (req, res) => {
  try {
    const products = await readJSON('products.json');
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      name: req.body.name,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      description: req.body.description,
      category: req.body.category,
      imageUrl: req.body.imageUrl || 'https://via.placeholder.com/400'
    };
    
    products.push(newProduct);
    await writeJSON('products.json', products);
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await readJSON('users.json');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const users = await readJSON('users.json');
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name: req.body.name,
      email: req.body.email,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeJSON('users.json', users);
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get cart
router.get('/cart', async (req, res) => {
  try {
    const cart = await readJSON('cart.json');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to cart
router.post('/cart', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await readJSON('cart.json');
    const products = await readJSON('products.json');
    
    const product = products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.push({ productId, quantity: quantity || 1 });
    }
    
    await writeJSON('cart.json', cart);
    res.json({ message: 'Added to cart', cart });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart quantity
router.patch('/cart', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await readJSON('cart.json');
    
    const item = cart.find(i => i.productId === productId);
    if (!item) {
      return res.status(404).json({ error: 'Item not in cart' });
    }
    
    if (quantity <= 0) {
      const index = cart.indexOf(item);
      cart.splice(index, 1);
    } else {
      item.quantity = quantity;
    }
    
    await writeJSON('cart.json', cart);
    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove from cart
router.delete('/cart/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const cart = await readJSON('cart.json');
    
    const index = cart.findIndex(item => item.productId === productId);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not in cart' });
    }
    
    cart.splice(index, 1);
    await writeJSON('cart.json', cart);
    
    res.json({ message: 'Item removed', cart });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await readJSON('orders.json');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order (checkout)
router.post('/orders', async (req, res) => {
  try {
    const cart = await readJSON('cart.json');
    const products = await readJSON('products.json');
    const orders = await readJSON('orders.json');
    
    if (cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    const orderItems = cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      };
    });
    
    const total = orderItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    const newOrder = {
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      items: orderItems,
      total,
      status: 'pending',
      date: new Date().toISOString()
    };
    
    orders.push(newOrder);
    await writeJSON('orders.json', orders);
    await writeJSON('cart.json', []); // Clear cart
    
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;