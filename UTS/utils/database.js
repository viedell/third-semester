// Hybrid database system - tries MongoDB, falls back to memory store

let memoryStore = {
  users: [],
  products: [],
  orders: [],
  carts: {},
  sessions: {}
};

// Sample products for memory store
const sampleProducts = [
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
  }
];

// Initialize memory store with sample data
function initializeMemoryStore() {
  if (memoryStore.products.length === 0) {
    memoryStore.products = sampleProducts;
    console.log('📦 Memory store initialized with sample products');
  }
  return true;
}

// User operations
async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase().trim();
  return memoryStore.users.find(user => user.email === normalizedEmail);
}

async function createUser(user) {
  memoryStore.users.push(user);
  console.log('✅ User created in memory store:', user.email);
  return user.id;
}

// Product operations
async function getProducts() {
  return memoryStore.products;
}

async function findProductById(id) {
  return memoryStore.products.find(product => product.id === parseInt(id));
}

// Cart operations
async function getCart(userId) {
  return memoryStore.carts[userId] || { items: [] };
}

async function updateCart(userId, items) {
  memoryStore.carts[userId] = { items, updatedAt: new Date() };
  return true;
}

// Simple session store for memory
const memorySessionStore = {
  sessions: {},
  
  get(sid, callback) {
    const session = this.sessions[sid];
    callback(null, session);
  },
  
  set(sid, session, callback) {
    this.sessions[sid] = session;
    callback(null);
  },
  
  destroy(sid, callback) {
    delete this.sessions[sid];
    callback(null);
  }
};

module.exports = {
  // Database functions
  findUserByEmail,
  createUser,
  getProducts,
  findProductById,
  getCart,
  updateCart,
  
  // Session store
  memorySessionStore,
  
  // Initialization
  initializeMemoryStore,
  
  // Export memory store for debugging
  memoryStore
};