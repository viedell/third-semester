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
        console.log(`✓ Created ${filename}`);
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
    console.log(`✓ Loaded ${filename}:`, Array.isArray(parsed) ? `${parsed.length} items` : 'Object');
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
    console.log(`✓ Saved ${filename}`);
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