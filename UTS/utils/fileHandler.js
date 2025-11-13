const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// In-memory storage for Vercel/serverless
let memoryStore = {
  users: [],
  products: [],
  orders: [],
  carts: {}, // Changed to object with userId as key
  sessions: []
};

let isInitialized = false;

const defaultProducts = [
  {
    id: 1,
    name: 'Premium Laptop',
    price: 999.99,
    stock: 10,
    description: 'High-performance laptop with cutting-edge specs',
    category: 'Electronics',
    imageUrl: 'https://source.unsplash.com/800x600/?laptop',
    rating: 4.8,
    reviews: 124
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    price: 29.99,
    stock: 50,
    description: 'Ergonomic wireless mouse with precision tracking',
    category: 'Accessories',
    imageUrl: 'https://source.unsplash.com/800x600/?wireless-mouse',
    rating: 4.5,
    reviews: 89
  },
  {
    id: 3,
    name: 'Mechanical Keyboard',
    price: 79.99,
    stock: 30,
    description: 'RGB mechanical keyboard with premium switches',
    category: 'Accessories',
    imageUrl: 'https://source.unsplash.com/800x600/?mechanical-keyboard',
    rating: 4.7,
    reviews: 156
  },
  {
    id: 4,
    name: '27" 4K Monitor',
    price: 349.99,
    stock: 15,
    description: '4K UHD monitor with HDR support and thin bezels',
    category: 'Electronics',
    imageUrl: 'https://source.unsplash.com/800x600/?monitor',
    rating: 4.9,
    reviews: 203
  },
  {
    id: 5,
    name: 'USB-C Hub',
    price: 49.99,
    stock: 40,
    description: 'Multi-port USB-C hub with fast charging',
    category: 'Accessories',
    imageUrl: 'https://source.unsplash.com/800x600/?usb-hub',
    rating: 4.3,
    reviews: 67
  },
  {
    id: 6,
    name: 'Webcam HD',
    price: 89.99,
    stock: 25,
    description: 'Crystal clear 1080p webcam for streaming and video calls',
    category: 'Electronics',
    imageUrl: 'https://source.unsplash.com/800x600/?webcam',
    rating: 4.6,
    reviews: 92
  },
  {
    id: 7,
    name: 'Noise-Cancelling Headphones',
    price: 199.99,
    stock: 18,
    description: 'Comfortable over-ear headphones with active noise-canceling',
    category: 'Audio',
    imageUrl: 'https://source.unsplash.com/800x600/?headphones',
    rating: 4.8,
    reviews: 178
  },
  {
    id: 8,
    name: 'Portable SSD 1TB',
    price: 149.99,
    stock: 32,
    description: 'Fast NVMe portable SSD, USB-C, pocket-sized',
    category: 'Storage',
    imageUrl: 'https://source.unsplash.com/800x600/?ssd',
    rating: 4.7,
    reviews: 145
  },
  {
    id: 9,
    name: 'Smartphone Gimbal',
    price: 119.99,
    stock: 22,
    description: '3-axis gimbal stabilizer for smooth mobile footage',
    category: 'Accessories',
    imageUrl: 'https://source.unsplash.com/800x600/?gimbal',
    rating: 4.4,
    reviews: 73
  },
  {
    id: 10,
    name: 'Bluetooth Speaker',
    price: 59.99,
    stock: 45,
    description: 'Portable Bluetooth speaker with rich bass and long battery',
    category: 'Audio',
    imageUrl: 'https://source.unsplash.com/800x600/?bluetooth-speaker',
    rating: 4.5,
    reviews: 112
  },
  {
    id: 11,
    name: 'USB Microphone',
    price: 129.99,
    stock: 20,
    description: 'Studio-quality USB microphone for streaming and podcasts',
    category: 'Audio',
    imageUrl: 'https://source.unsplash.com/800x600/?microphone',
    rating: 4.9,
    reviews: 187
  },
  {
    id: 12,
    name: 'Ergonomic Laptop Stand',
    price: 39.99,
    stock: 60,
    description: 'Aluminum stand to elevate laptop for better posture',
    category: 'Accessories',
    imageUrl: 'https://source.unsplash.com/800x600/?laptop-stand',
    rating: 4.6,
    reviews: 98
  }
];

async function initializeDataFiles() {
  if (isInitialized) return;
  
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    const files = {
      'users.json': [],
      'products.json': defaultProducts,
      'orders.json': [],
      'carts.json': {},
      'sessions.json': []
    };

    for (const [filename, defaultData] of Object.entries(files)) {
      const filepath = path.join(DATA_DIR, filename);
      try {
        await fs.access(filepath);
      } catch {
        await fs.writeFile(filepath, JSON.stringify(defaultData, null, 2));
      }
    }
    
    console.log('✓ Using file-based storage (local)');
  } catch (error) {
    console.log('✓ Using in-memory storage (serverless)');
    memoryStore.products = defaultProducts;
  }
  
  isInitialized = true;
}

async function readJSON(filename) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    const key = filename.replace('.json', '');
    return memoryStore[key] || (key === 'carts' ? {} : []);
  }
}

async function writeJSON(filename, data) {
  try {
    await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  } catch (error) {
    const key = filename.replace('.json', '');
    memoryStore[key] = data;
  }
}

module.exports = {
  initializeDataFiles,
  readJSON,
  writeJSON
};