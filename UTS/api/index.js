const express = require('express');
const session = require('express-session');
const { MongoClient } = require('mongodb');
const { 
  hashPassword, 
  comparePassword, 
  isValidEmail, 
  isValidPassword, 
  sanitizeUser,
  generateId 
} = require('../utils/helpers');

const app = express();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'techstore';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(DB_NAME);
    cachedDb = db;
    
    console.log('✅ Connected to MongoDB Atlas');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Database functions
async function findUserByEmail(email) {
  const db = await connectToDatabase();
  return await db.collection('users').findOne({ email: email.toLowerCase().trim() });
}

async function createUser(user) {
  const db = await connectToDatabase();
  const result = await db.collection('users').insertOne(user);
  return result.insertedId;
}

async function getProducts() {
  const db = await connectToDatabase();
  return await db.collection('products').find({}).toArray();
}

async function findProductById(id) {
  const db = await connectToDatabase();
  return await db.collection('products').findOne({ id: parseInt(id) });
}

async function getCart(userId) {
  const db = await connectToDatabase();
  return await db.collection('carts').findOne({ userId: parseInt(userId) });
}

async function updateCart(userId, items) {
  const db = await connectToDatabase();
  return await db.collection('carts').updateOne(
    { userId: parseInt(userId) },
    { 
      $set: { 
        items: items, 
        updatedAt: new Date() 
      } 
    },
    { upsert: true }
  );
}

// Session store using MongoDB (fixes MemoryStore warning)
const MongoStore = require('connect-mongo');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware with MongoDB store
app.use(session({
  name: 'techstore.sid',
  secret: process.env.SESSION_SECRET || 'techstore-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    dbName: DB_NAME,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: true, // Vercel uses HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Make user available in all routes
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Import views
const { createLayout } = require('../views/layout');

// Helper function to render views
function renderView(res, viewFunction, data = {}) {
  const html = viewFunction(data);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}

// Routes
app.get('/', async (req, res) => {
  try {
    const products = await getProducts();
    const featuredProducts = products.slice(0, 6);
    
    const homeView = require('../views/home');
    renderView(res, homeView, { 
      featuredProducts, 
      user: req.session.user 
    });
  } catch (error) {
    console.error('Home page error:', error);
    const homeView = require('../views/home');
    renderView(res, homeView, { 
      featuredProducts: [], 
      user: req.session.user 
    });
  }
});

app.get('/products', async (req, res) => {
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
    
    const productsView = require('../views/products');
    renderView(res, productsView, { 
      products, 
      category, 
      search,
      user: req.session.user 
    });
  } catch (error) {
    console.error('Products page error:', error);
    const productsView = require('../views/products');
    renderView(res, productsView, { 
      products: [], 
      category: null, 
      search: null,
      user: req.session.user 
    });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await findProductById(req.params.id);
    
    if (!product) {
      return res.status(404).send('Product not found');
    }
    
    const productView = require('../views/product');
    renderView(res, productView, { 
      product, 
      user: req.session.user 
    });
  } catch (error) {
    console.error('Product page error:', error);
    res.status(500).send('Server error');
  }
});

// Auth routes
app.get('/auth/login', (req, res) => {
  const redirect = req.query.redirect || '/';
  const loginView = require('../views/login');
  renderView(res, loginView, { 
    redirect, 
    error: null, 
    user: req.session.user 
  });
});

app.get('/auth/register', (req, res) => {
  const registerView = require('../views/register');
  renderView(res, registerView, { 
    error: null, 
    user: req.session.user 
  });
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const redirect = req.body.redirect || '/';
    
    if (!email || !password) {
      const loginView = require('../views/login');
      return renderView(res, loginView, { 
        redirect, 
        error: 'Email and password are required',
        user: req.session.user 
      });
    }

    const user = await findUserByEmail(email);
    
    if (!user || !comparePassword(password, user.password)) {
      const loginView = require('../views/login');
      return renderView(res, loginView, { 
        redirect, 
        error: 'Invalid email or password',
        user: req.session.user 
      });
    }

    req.session.user = sanitizeUser(user);
    res.redirect(redirect);
    
  } catch (error) {
    console.error('Login error:', error);
    const loginView = require('../views/login');
    renderView(res, loginView, { 
      redirect: req.body.redirect || '/', 
      error: 'Server error during login',
      user: req.session.user 
    });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    
    if (!email || !password || !confirmPassword) {
      const registerView = require('../views/register');
      return renderView(res, registerView, { 
        error: 'All fields are required',
        user: req.session.user 
      });
    }

    if (!isValidEmail(email)) {
      const registerView = require('../views/register');
      return renderView(res, registerView, { 
        error: 'Please enter a valid email address',
        user: req.session.user 
      });
    }

    if (!isValidPassword(password)) {
      const registerView = require('../views/register');
      return renderView(res, registerView, { 
        error: 'Password must be at least 6 characters long',
        user: req.session.user 
      });
    }

    if (password !== confirmPassword) {
      const registerView = require('../views/register');
      return renderView(res, registerView, { 
        error: 'Passwords do not match',
        user: req.session.user 
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      const registerView = require('../views/register');
      return renderView(res, registerView, { 
        error: 'User with this email already exists',
        user: req.session.user 
      });
    }

    const emailUsername = email.split('@')[0];
    const name = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
    
    const newUser = {
      id: generateId(),
      name: name,
      email: email.toLowerCase().trim(),
      password: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    await createUser(newUser);
    req.session.user = sanitizeUser(newUser);
    res.redirect('/profile');
    
  } catch (error) {
    console.error('Registration error:', error);
    const registerView = require('../views/register');
    renderView(res, registerView, { 
      error: 'Registration failed. Please try again.',
      user: req.session.user 
    });
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

// Protected routes
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

app.get('/profile', requireAuth, (req, res) => {
  const profileView = require('../views/profile');
  renderView(res, profileView, { 
    user: req.session.user,
    error: null,
    success: null
  });
});

app.get('/cart', requireAuth, (req, res) => {
  const cartView = require('../views/cart');
  renderView(res, cartView, { 
    user: req.session.user 
  });
});

app.get('/orders', requireAuth, async (req, res) => {
  try {
    // For now, return empty orders - you can implement this later
    const ordersView = require('../views/orders');
    renderView(res, ordersView, { 
      orders: [],
      user: req.session.user 
    });
  } catch (error) {
    console.error('Orders page error:', error);
    const ordersView = require('../views/orders');
    renderView(res, ordersView, { 
      orders: [],
      user: req.session.user 
    });
  }
});

// API routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/cart', requireAuth, async (req, res) => {
  try {
    const cart = await getCart(req.session.user.id);
    const cartItems = cart ? cart.items : [];
    
    const products = await getProducts();
    const cartWithDetails = cartItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { ...item, product } : null;
    }).filter(Boolean);
    
    res.json(cartWithDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.post('/api/cart', requireAuth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const product = await findProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const userId = req.session.user.id;
    let cart = await getCart(userId);
    let userCart = cart ? cart.items : [];
    
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
    
    await updateCart(userId, userCart);
    res.json({ success: true, cart: userCart });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Initialize products on first run
async function initializeProducts() {
  try {
    const db = await connectToDatabase();
    const productCount = await db.collection('products').countDocuments();
    
    if (productCount === 0) {
      console.log('📦 Initializing products...');
      await db.collection('products').insertMany([
        {
          id: 1,
          name: 'Quantum Laptop Pro',
          price: 1999.99,
          stock: 8,
          description: 'Next-gen quantum computing laptop with neural processor',
          category: 'Electronics',
          imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=400&fit=crop',
          rating: 4.9,
          reviews: 156,
          features: ['Quantum CPU', '32GB RAM', '2TB SSD']
        },
        {
          id: 2,
          name: 'Neural Mouse X',
          price: 129.99,
          stock: 25,
          description: 'AI-enhanced mouse with predictive cursor technology',
          category: 'Accessories',
          imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=400&fit=crop',
          rating: 4.7,
          reviews: 89,
          features: ['AI Prediction', '10K DPI', 'Wireless Charging']
        }
      ]);
      console.log('✅ Products initialized');
    }
  } catch (error) {
    console.error('❌ Product initialization failed:', error);
  }
}

// Export the Express app for Vercel
module.exports = app;

// Initialize products when the function starts
initializeProducts().catch(console.error);