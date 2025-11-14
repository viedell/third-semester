const { MongoClient } = require('mongodb');

let db = null;
let client = null;

async function connectDB() {
  if (db) return db;

  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db('techstore');
    
    // Create indexes for better performance
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('orders').createIndex({ userId: 1 });
    
    // Initialize with default products if empty
    const productCount = await db.collection('products').countDocuments();
    if (productCount === 0) {
      await initializeProducts();
    }
    
    console.log('✅ MongoDB Connected Successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
}

async function initializeProducts() {
  const defaultProducts = [
    {
      name: 'Premium Laptop',
      price: 999.99,
      stock: 10,
      description: 'High-performance laptop with cutting-edge specs',
      category: 'Electronics',
      imageUrl: 'https://source.unsplash.com/800x600/?laptop',
      rating: 4.8,
      reviews: 124,
      createdAt: new Date()
    },
    {
      name: 'Wireless Mouse',
      price: 29.99,
      stock: 50,
      description: 'Ergonomic wireless mouse with precision tracking',
      category: 'Accessories',
      imageUrl: 'https://source.unsplash.com/800x600/?wireless-mouse',
      rating: 4.5,
      reviews: 89,
      createdAt: new Date()
    },
    {
      name: 'Mechanical Keyboard',
      price: 79.99,
      stock: 30,
      description: 'RGB mechanical keyboard with premium switches',
      category: 'Accessories',
      imageUrl: 'https://source.unsplash.com/800x600/?mechanical-keyboard',
      rating: 4.7,
      reviews: 156,
      createdAt: new Date()
    },
    {
      name: '27" 4K Monitor',
      price: 349.99,
      stock: 15,
      description: '4K UHD monitor with HDR support and thin bezels',
      category: 'Electronics',
      imageUrl: 'https://source.unsplash.com/800x600/?monitor',
      rating: 4.9,
      reviews: 203,
      createdAt: new Date()
    },
    {
      name: 'USB-C Hub',
      price: 49.99,
      stock: 40,
      description: 'Multi-port USB-C hub with fast charging',
      category: 'Accessories',
      imageUrl: 'https://source.unsplash.com/800x600/?usb-hub',
      rating: 4.3,
      reviews: 67,
      createdAt: new Date()
    },
    {
      name: 'Webcam HD',
      price: 89.99,
      stock: 25,
      description: 'Crystal clear 1080p webcam for streaming',
      category: 'Electronics',
      imageUrl: 'https://source.unsplash.com/800x600/?webcam',
      rating: 4.6,
      reviews: 92,
      createdAt: new Date()
    },
    {
      name: 'Noise-Cancelling Headphones',
      price: 199.99,
      stock: 18,
      description: 'Comfortable over-ear headphones with active noise-canceling',
      category: 'Audio',
      imageUrl: 'https://source.unsplash.com/800x600/?headphones',
      rating: 4.8,
      reviews: 178,
      createdAt: new Date()
    },
    {
      name: 'Portable SSD 1TB',
      price: 149.99,
      stock: 32,
      description: 'Fast NVMe portable SSD, USB-C, pocket-sized',
      category: 'Storage',
      imageUrl: 'https://source.unsplash.com/800x600/?ssd',
      rating: 4.7,
      reviews: 145,
      createdAt: new Date()
    },
    {
      name: 'Smartphone Gimbal',
      price: 119.99,
      stock: 22,
      description: '3-axis gimbal stabilizer for smooth mobile footage',
      category: 'Accessories',
      imageUrl: 'https://source.unsplash.com/800x600/?gimbal',
      rating: 4.4,
      reviews: 73,
      createdAt: new Date()
    },
    {
      name: 'Bluetooth Speaker',
      price: 59.99,
      stock: 45,
      description: 'Portable Bluetooth speaker with rich bass',
      category: 'Audio',
      imageUrl: 'https://source.unsplash.com/800x600/?bluetooth-speaker',
      rating: 4.5,
      reviews: 112,
      createdAt: new Date()
    },
    {
      name: 'USB Microphone',
      price: 129.99,
      stock: 20,
      description: 'Studio-quality USB microphone for streaming',
      category: 'Audio',
      imageUrl: 'https://source.unsplash.com/800x600/?microphone',
      rating: 4.9,
      reviews: 187,
      createdAt: new Date()
    },
    {
      name: 'Ergonomic Laptop Stand',
      price: 39.99,
      stock: 60,
      description: 'Aluminum stand to elevate laptop for better posture',
      category: 'Accessories',
      imageUrl: 'https://source.unsplash.com/800x600/?laptop-stand',
      rating: 4.6,
      reviews: 98,
      createdAt: new Date()
    }
  ];

  await db.collection('products').insertMany(defaultProducts);
  console.log('✅ Default products initialized');
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
}

module.exports = {
  connectDB,
  getDB
};


// ============================================
// FILE 3: middleware/auth.js (NEW)
// ============================================
function requireAuth(req, res, next) {
  if (!req.session.user) {
    if (req.headers['content-type'] === 'application/json' || 
        req.path.startsWith('/api/')) {
      return res.status(401).json({ 
        error: 'Please login to continue',
        requiresAuth: true 
      });
    }
    return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

function requireGuest(req, res, next) {
  if (req.session.user) {
    return res.redirect('/profile');
  }
  next();
}

module.exports = {
  requireAuth,
  requireGuest
};
