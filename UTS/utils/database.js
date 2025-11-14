const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://viedellleonardti24_db_user:qu3qg1Hz7vWTNikz@cluster0.xmqgpd3.mongodb.net/techstore?retryWrites=true&w=majority';
const DB_NAME = 'techstore';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(DB_NAME);
    
    cachedClient = client;
    cachedDb = db;
    
    console.log('✅ Connected to MongoDB Atlas');
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// User operations
async function getUsers() {
  const { db } = await connectToDatabase();
  return await db.collection('users').find({}).toArray();
}

async function findUserByEmail(email) {
  const { db } = await connectToDatabase();
  return await db.collection('users').findOne({ email: email.toLowerCase().trim() });
}

async function createUser(user) {
  const { db } = await connectToDatabase();
  const result = await db.collection('users').insertOne(user);
  return result.insertedId;
}

// Product operations
async function getProducts() {
  const { db } = await connectToDatabase();
  return await db.collection('products').find({}).toArray();
}

async function findProductById(id) {
  const { db } = await connectToDatabase();
  return await db.collection('products').findOne({ id: parseInt(id) });
}

// Cart operations
async function getCart(userId) {
  const { db } = await connectToDatabase();
  return await db.collection('carts').findOne({ userId: parseInt(userId) });
}

async function updateCart(userId, items) {
  const { db } = await connectToDatabase();
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

// Order operations
async function createOrder(order) {
  const { db } = await connectToDatabase();
  const result = await db.collection('orders').insertOne({
    ...order,
    createdAt: new Date()
  });
  return result.insertedId;
}

async function getOrders(userId) {
  const { db } = await connectToDatabase();
  return await db.collection('orders')
    .find({ userId: parseInt(userId) })
    .sort({ createdAt: -1 })
    .toArray();
}

// Initialize database with sample data
async function initializeDatabase() {
  try {
    const { db } = await connectToDatabase();
    
    // Check if products already exist
    const productCount = await db.collection('products').countDocuments();
    if (productCount === 0) {
      console.log('📦 Initializing products database...');
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
          features: ['Quantum CPU', '32GB RAM', '2TB SSD', '17" OLED']
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
        },
        {
          id: 3,
          name: 'Mechanical Keyboard RGB',
          price: 179.99,
          stock: 15,
          description: 'Full RGB mechanical keyboard with tactile switches',
          category: 'Accessories',
          imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=400&fit=crop',
          rating: 4.8,
          reviews: 203,
          features: ['RGB Lighting', 'Tactile Switches', 'N-Key Rollover']
        },
        {
          id: 4,
          name: 'Holographic Monitor 32"',
          price: 899.99,
          stock: 6,
          description: 'True holographic display with 8K resolution',
          category: 'Electronics',
          imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=400&fit=crop',
          rating: 4.9,
          reviews: 78,
          features: ['8K Holographic', '240Hz', 'HDR2000']
        },
        {
          id: 5,
          name: 'Quantum SSD 4TB',
          price: 399.99,
          stock: 20,
          description: 'Lightning-fast quantum storage solution',
          category: 'Storage',
          imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&h=400&fit=crop',
          rating: 4.8,
          reviews: 145,
          features: ['4TB Capacity', '10GB/s Read', 'Quantum Encryption']
        },
        {
          id: 6,
          name: 'VR Headset Pro',
          price: 599.99,
          stock: 12,
          description: 'Immersive virtual reality with eye tracking',
          category: 'Electronics',
          imageUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500&h=400&fit=crop',
          rating: 4.6,
          reviews: 92,
          features: ['Eye Tracking', '4K per Eye', 'Wireless']
        }
      ]);
      console.log('✅ Products initialized successfully');
    }
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

module.exports = {
  connectToDatabase,
  getUsers,
  findUserByEmail,
  createUser,
  getProducts,
  findProductById,
  getCart,
  updateCart,
  createOrder,
  getOrders,
  initializeDatabase
};