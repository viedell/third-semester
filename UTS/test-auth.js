const fs = require('fs').promises;
const path = require('path');
const { hashPassword } = require('./utils/helpers');

async function resetWithProducts() {
  console.log('🔄 RESETTING SYSTEM WITH PRODUCTS');
  console.log('='.repeat(50));
  
  try {
    const dataDir = path.join(__dirname, 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Test user
    const testUser = {
      id: 1001,
      name: 'Testuser',
      email: 'test@example.com',
      password: hashPassword('password123'),
      createdAt: new Date().toISOString()
    };
    
    // Products
    const products = [
      {
        id: 1,
        name: 'Quantum Laptop Pro',
        price: 1999.99,
        stock: 8,
        description: 'Next-gen quantum computing laptop',
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
        description: 'AI-enhanced mouse with predictive technology',
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=400&fit=crop',
        rating: 4.7,
        reviews: 89,
        features: ['AI Prediction', '10K DPI', 'Wireless']
      },
      {
        id: 3,
        name: 'Mechanical Keyboard',
        price: 179.99,
        stock: 15,
        description: 'RGB mechanical keyboard with tactile switches',
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=400&fit=crop',
        rating: 4.8,
        reviews: 203,
        features: ['RGB Lighting', 'Tactile Switches', 'N-Key Rollover']
      }
    ];
    
    const files = {
      'users.json': [testUser],
      'products.json': products,
      'orders.json': [],
      'carts.json': {}
    };
    
    for (const [filename, data] of Object.entries(files)) {
      await fs.writeFile(path.join(dataDir, filename), JSON.stringify(data, null, 2));
      console.log(`✅ ${filename}: ${Array.isArray(data) ? data.length : 'data'} items`);
    }
    
    console.log('\n🎉 RESET COMPLETE!');
    console.log('📦 Products: 10 items');
    console.log('👤 Test user: test@example.com / password123');
    console.log('\n🚀 Start server: npm start');
    
  } catch (error) {
    console.error('❌ RESET FAILED:', error);
  }
}

resetWithProducts();