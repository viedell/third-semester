const express = require('express');
const session = require('express-session');
const { 
  findUserByEmail, 
  createUser, 
  getProducts, 
  findProductById, 
  getCart, 
  updateCart,
  initializeMemoryStore
} = require('../utils/database');
const { 
  hashPassword, 
  comparePassword, 
  isValidEmail, 
  isValidPassword, 
  sanitizeUser,
  generateId 
} = require('../utils/helpers');

const app = express();

// Initialize memory store
initializeMemoryStore();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware with default MemoryStore (Vercel compatible)
// Note: This will show the warning but it's fine for demo purposes
app.use(session({
  name: 'techstore.sid',
  secret: process.env.SESSION_SECRET || 'techstore-memory-store-secret-2024',
  resave: false,
  saveUninitialized: false,
  // Using default MemoryStore - it shows a warning but works for Vercel
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
    
    console.log('🔑 LOGIN ATTEMPT:', { email });
    
    if (!email || !password) {
      const loginView = require('../views/login');
      return renderView(res, loginView, { 
        redirect, 
        error: 'Email and password are required',
        user: req.session.user 
      });
    }

    const user = await findUserByEmail(email);
    console.log('👤 User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      const loginView = require('../views/login');
      return renderView(res, loginView, { 
        redirect, 
        error: 'Invalid email or password',
        user: req.session.user 
      });
    }

    const isPasswordValid = comparePassword(password, user.password);
    console.log('✅ Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      const loginView = require('../views/login');
      return renderView(res, loginView, { 
        redirect, 
        error: 'Invalid email or password',
        user: req.session.user 
      });
    }

    req.session.user = sanitizeUser(user);
    console.log('✅ LOGIN SUCCESSFUL');
    res.redirect(redirect);
    
  } catch (error) {
    console.error('💥 LOGIN ERROR:', error);
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
    
    console.log('📝 REGISTRATION ATTEMPT:', { email });
    
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

    console.log('💾 Creating user in memory store...');
    await createUser(newUser);
    console.log('✅ User created successfully');

    req.session.user = sanitizeUser(newUser);
    console.log('✅ REGISTRATION COMPLETE');
    res.redirect('/profile');
    
  } catch (error) {
    console.error('💥 REGISTRATION ERROR:', error);
    const registerView = require('../views/register');
    renderView(res, registerView, { 
      error: 'Registration failed. Please try again.',
      user: req.session.user 
    });
  }
});

app.get('/auth/logout', (req, res) => {
  console.log('🚪 LOGOUT:', req.session.user?.email);
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
    const cartItems = cart.items || [];
    
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
    let userCart = cart.items || [];
    
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

app.put('/api/cart/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    const userId = req.session.user.id;
    let cart = await getCart(userId);
    let userCart = cart.items || [];
    
    const item = userCart.find(item => item.productId === parseInt(productId));
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      userCart = userCart.filter(item => item.productId !== parseInt(productId));
    } else {
      item.quantity = parseInt(quantity);
    }
    
    await updateCart(userId, userCart);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

app.delete('/api/cart/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.session.user.id;
    
    let cart = await getCart(userId);
    let userCart = cart.items || [];
    
    userCart = userCart.filter(item => item.productId !== parseInt(productId));
    await updateCart(userId, userCart);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Export the Express app for Vercel
module.exports = app;