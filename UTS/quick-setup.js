const fs = require('fs').promises;
const path = require('path');

async function quickSetup() {
  const dataDir = path.join(__dirname, 'data');
  
  try {
    await fs.mkdir(dataDir, { recursive: true });
    console.log('✓ Created data directory');
    
    // Create products with all required fields
    const products = [
      {
        id: 1,
        name: "Quantum Laptop Pro",
        price: 1999.99,
        stock: 8,
        description: "Next-gen quantum computing laptop with neural processor",
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=400&fit=crop",
        rating: 4.9,
        reviews: 156,
        features: ["Quantum CPU", "32GB RAM", "2TB SSD", '17" OLED']
      },
      {
        id: 2,
        name: "Neural Mouse X",
        price: 129.99,
        stock: 25,
        description: "AI-enhanced mouse with predictive cursor technology",
        category: "Accessories",
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=400&fit=crop",
        rating: 4.7,
        reviews: 89,
        features: ["AI Prediction", "10K DPI", "Wireless Charging"]
      }
    ];
    
    const files = {
      'users.json': [],
      'products.json': products,
      'orders.json': [],
      'carts.json': {}
    };
    
    for (const [filename, data] of Object.entries(files)) {
      await fs.writeFile(path.join(dataDir, filename), JSON.stringify(data, null, 2));
      console.log(`✓ Created ${filename}`);
    }
    
    console.log('🎉 Setup completed! Run: npm start');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

quickSetup();