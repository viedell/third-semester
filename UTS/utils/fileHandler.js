const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// In-memory storage for serverless environments
let memoryStore = {
  users: [],
  products: [],
  orders: [],
  carts: {}
};

let isInitialized = false;

const defaultProducts = [
  {
    id: 1,
    name: 'Quantum Laptop Pro',
    price: 1999.99,
    stock: 8,
    description: 'Next-gen quantum computing laptop with neural processor and holographic display',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=400&fit=crop',
    rating: 4.9,
    reviews: 156,
    features: ['Quantum CPU', '32GB RAM', '2TB SSD', '17" OLED', 'Holographic Display']
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
  }
];

async function initializeDataFiles() {
  if (isInitialized) return;
  
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('✓ Data directory created');
    
    const files = {
      'users.json': [],
      'products.json': defaultProducts,
      'orders.json': [],
      'carts.json': {}
    };

    for (const [filename, defaultData] of Object.entries(files)) {
      const filepath = path.join(DATA_DIR, filename);
      try {
        await fs.access(filepath);
        console.log(`✓ ${filename} exists`);
      } catch {
        await fs.writeFile(filepath, JSON.stringify(defaultData, null, 2));
        console.log(`✓ Created ${filename} with ${Array.isArray(defaultData) ? defaultData.length : 'data'} items`);
      }
    }
    
    console.log('✓ Using file-based storage');
  } catch (error) {
    console.log('✓ Using in-memory storage');
    memoryStore.products = defaultProducts;
    memoryStore.users = [];
    memoryStore.orders = [];
    memoryStore.carts = {};
  }
  
  isInitialized = true;
}

async function readJSON(filename) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.log(`✓ Using memory store for ${filename}`);
    const key = filename.replace('.json', '');
    return memoryStore[key] || (key === 'carts' ? {} : []);
  }
}

async function writeJSON(filename, data) {
  try {
    await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`✓ Saved to memory store for ${filename}`);
    const key = filename.replace('.json', '');
    memoryStore[key] = data;
  }
}

module.exports = {
  initializeDataFiles,
  readJSON,
  writeJSON
};