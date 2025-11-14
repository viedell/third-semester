const { MongoClient } = require('mongodb');

// Use Vercel's provided MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    console.log('🔗 Connecting to Vercel MongoDB...');
    
    const client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    
    // Vercel MongoDB automatically creates database, use the one from connection string
    const dbName = new URL(MONGODB_URI).pathname.substring(1); // Get database name from URI
    const db = client.db(dbName);
    
    cachedClient = client;
    cachedDb = db;
    
    console.log('✅ Connected to Vercel MongoDB:', dbName);
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

// User operations
async function findUserByEmail(email) {
  try {
    const { db } = await connectToDatabase();
    return await db.collection('users').findOne({ email: email.toLowerCase().trim() });
  } catch (error) {
    console.error('Error finding user:', error.message);
    throw error;
  }
}

async function createUser(user) {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('users').insertOne(user);
    console.log('✅ User created in Vercel MongoDB:', user.email);
    return result.insertedId;
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
}

// Product operations
async function getProducts() {
  try {
    const { db } = await connectToDatabase();
    return await db.collection('products').find({}).toArray();
  } catch (error) {
    console.error('Error getting products:', error.message);
    // Return sample products if DB fails
    return getSampleProducts();
  }
}

async function findProductById(id) {
  try {
    const { db } = await connectToDatabase();
    return await db.collection('products').findOne({ id: parseInt(id) });
  } catch (error) {
    console.error('Error finding product:', error.message);
    return getSampleProducts().find(p => p.id === parseInt(id));
  }
}

// Cart operations
async function getCart(userId) {
  try {
    const { db } = await connectToDatabase();
    return await db.collection('carts').findOne({ userId: parseInt(userId) });
  } catch (error) {
    console.error('Error getting cart:', error.message);
    return { items: [] };
  }
}

async function updateCart(userId, items) {
  try {
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
  } catch (error) {
    console.error('Error updating cart:', error.message);
    return { modifiedCount: 1 };
  }
}

// Initialize database with sample products
async function initializeDatabase() {
  try {
    const { db } = await connectToDatabase();
    
    // Check if products already exist
    const productCount = await db.collection('products').countDocuments();
    if (productCount === 0) {
      console.log('📦 Initializing products in Vercel MongoDB...');
      const products = getSampleProducts();
      await db.collection('products').insertMany(products);
      console.log(`✅ ${products.length} products initialized in Vercel MongoDB`);
    } else {
      console.log(`📦 ${productCount} products already exist in Vercel MongoDB`);
    }
    
    // Create indexes for better performance
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('products').createIndex({ id: 1 }, { unique: true });
    await db.collection('carts').createIndex({ userId: 1 }, { unique: true });
    
    console.log('✅ Vercel MongoDB initialization complete');
  } catch (error) {
    console.error('❌ Vercel MongoDB initialization failed:', error.message);
  }
}

// Sample products data (20 products)
function getSampleProducts() {
  return [
    {
      id: 1,
      name: 'Quantum Laptop Pro',
      price: 1999.99,
      stock: 8,
      description: 'Next-gen quantum computing laptop with neural processor and 17" OLED display',
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=400&fit=crop',
      rating: 4.9,
      reviews: 156,
      features: ['Quantum CPU', '32GB RAM', '2TB SSD', '17" OLED', 'Neural Processor']
    },
    {
      id: 2,
      name: 'Neural Mouse X',
      price: 129.99,
      stock: 25,
      description: 'AI-enhanced mouse with predictive cursor technology and haptic feedback',
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=400&fit=crop',
      rating: 4.7,
      reviews: 89,
      features: ['AI Prediction', '10K DPI', 'Wireless Charging', 'Haptic Feedback']
    },
    {
      id: 3,
      name: 'Mechanical Keyboard RGB Pro',
      price: 179.99,
      stock: 15,
      description: 'Full RGB mechanical keyboard with tactile switches and programmable macros',
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=400&fit=crop',
      rating: 4.8,
      reviews: 203,
      features: ['RGB Lighting', 'Tactile Switches', 'N-Key Rollover', 'Programmable Macros']
    },
    {
      id: 4,
      name: 'Holographic Monitor 32"',
      price: 899.99,
      stock: 6,
      description: 'True holographic display with 8K resolution and 240Hz refresh rate',
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=400&fit=crop',
      rating: 4.9,
      reviews: 78,
      features: ['8K Holographic', '240Hz', 'HDR2000', 'Nano-IPS Panel']
    },
    {
      id: 5,
      name: 'Quantum SSD 4TB',
      price: 399.99,
      stock: 20,
      description: 'Lightning-fast quantum storage solution with hardware encryption',
      category: 'Storage',
      imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&h=400&fit=crop',
      rating: 4.8,
      reviews: 145,
      features: ['4TB Capacity', '10GB/s Read', 'Quantum Encryption', 'Shock Resistant']
    },
    {
      id: 6,
      name: 'VR Headset Pro',
      price: 599.99,
      stock: 12,
      description: 'Immersive virtual reality with eye tracking and wireless connectivity',
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500&h=400&fit=crop',
      rating: 4.6,
      reviews: 92,
      features: ['Eye Tracking', '4K per Eye', 'Wireless', '120Hz Refresh']
    },
    {
      id: 7,
      name: 'Smart Watch Series X',
      price: 349.99,
      stock: 30,
      description: 'Advanced smartwatch with health monitoring and LTE connectivity',
      category: 'Wearables',
      imageUrl: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500&h=400&fit=crop',
      rating: 4.7,
      reviews: 234,
      features: ['ECG Monitor', 'LTE Connectivity', '7-Day Battery', 'Always-on Display']
    },
    {
      id: 8,
      name: 'Wireless Earbuds Pro',
      price: 229.99,
      stock: 45,
      description: 'True wireless earbuds with active noise cancellation and spatial audio',
      category: 'Audio',
      imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=400&fit=crop',
      rating: 4.8,
      reviews: 189,
      features: ['Active Noise Cancel', 'Spatial Audio', '30hr Battery', 'Wireless Charging']
    },
    {
      id: 9,
      name: 'Gaming Chair Elite',
      price: 499.99,
      stock: 10,
      description: 'Ergonomic gaming chair with lumbar support and RGB lighting',
      category: 'Furniture',
      imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=400&fit=crop',
      rating: 4.5,
      reviews: 67,
      features: ['Ergonomic Design', 'Lumbar Support', 'RGB Lighting', 'Adjustable Height']
    },
    {
      id: 10,
      name: 'Portable Projector 4K',
      price: 299.99,
      stock: 18,
      description: 'Compact 4K portable projector with built-in battery and Android TV',
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=400&fit=crop',
      rating: 4.4,
      reviews: 123,
      features: ['4K Resolution', 'Built-in Battery', 'Android TV', '100" Projection']
    },
    {
      id: 11,
      name: 'Webcam Ultra HD',
      price: 149.99,
      stock: 35,
      description: '4K webcam with AI background removal and studio-quality microphone',
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=400&fit=crop',
      rating: 4.6,
      reviews: 156,
      features: ['4K Resolution', 'AI Background Removal', 'Studio Mic', 'Auto Focus']
    },
    {
      id: 12,
      name: 'Tablet Pro 12.9"',
      price: 1099.99,
      stock: 14,
      description: 'Professional tablet with mini-LED display and M2 chip',
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=400&fit=crop',
      rating: 4.9,
      reviews: 278,
      features: ['Mini-LED Display', 'M2 Chip', '5G Connectivity', 'Apple Pencil Support']
    },
    {
      id: 13,
      name: 'Smart Home Hub',
      price: 199.99,
      stock: 22,
      description: 'Central smart home controller with voice assistant and Matter support',
      category: 'Smart Home',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25856cd63?w=500&h=400&fit=crop',
      rating: 4.5,
      reviews: 89,
      features: ['Voice Control', 'Matter Support', 'Zigbee & Z-Wave', 'Privacy Focused']
    },
    {
      id: 14,
      name: 'Drone Pro 4K',
      price: 799.99,
      stock: 8,
      description: 'Professional drone with 4K camera and 30-minute flight time',
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=400&fit=crop',
      rating: 4.7,
      reviews: 134,
      features: ['4K Camera', '30min Flight', 'GPS Tracking', 'Obstacle Avoidance']
    },
    {
      id: 15,
      name: 'External GPU Dock',
      price: 349.99,
      stock: 12,
      description: 'Thunderbolt 4 eGPU dock for laptop graphics enhancement',
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&h=400&fit=crop',
      rating: 4.4,
      reviews: 76,
      features: ['Thunderbolt 4', 'RTX 3070', 'Multi-port Hub', 'Tool-free Installation']
    },
    {
      id: 16,
      name: 'Noise Cancelling Headphones',
      price: 299.99,
      stock: 25,
      description: 'Premium over-ear headphones with advanced noise cancellation',
      category: 'Audio',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop',
      rating: 4.8,
      reviews: 312,
      features: ['Active Noise Cancel', '30hr Battery', 'Touch Controls', 'Foldable Design']
    },
    {
      id: 17,
      name: 'Smartphone Gimbal',
      price: 199.99,
      stock: 18,
      description: '3-axis gimbal stabilizer for smooth mobile footage and vlogging',
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=400&fit=crop',
      rating: 4.6,
      reviews: 167,
      features: ['3-Axis Stabilization', 'Object Tracking', 'Time-lapse', 'Portable']
    },
    {
      id: 18,
      name: 'Wireless Charging Pad',
      price: 79.99,
      stock: 50,
      description: 'Fast wireless charging pad compatible with all Qi-enabled devices',
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=400&fit=crop',
      rating: 4.3,
      reviews: 89,
      features: ['15W Fast Charge', 'Multi-Device', 'LED Indicator', 'Non-slip Surface']
    },
    {
      id: 19,
      name: 'Gaming Monitor 27"',
      price: 449.99,
      stock: 15,
      description: 'High-performance gaming monitor with 165Hz refresh rate',
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&h=400&fit=crop',
      rating: 4.7,
      reviews: 203,
      features: ['165Hz Refresh', '1ms Response', 'HDR400', 'AMD FreeSync']
    },
    {
      id: 20,
      name: 'Bluetooth Speaker',
      price: 129.99,
      stock: 40,
      description: 'Portable Bluetooth speaker with 360° sound and waterproof design',
      category: 'Audio',
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=400&fit=crop',
      rating: 4.5,
      reviews: 178,
      features: ['360° Sound', 'IPX7 Waterproof', '24hr Battery', 'Party Mode']
    }
  ];
}

module.exports = {
  connectToDatabase,
  findUserByEmail,
  createUser,
  getProducts,
  findProductById,
  getCart,
  updateCart,
  initializeDatabase
};