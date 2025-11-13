const fs = require('fs').promises;
const path = require('path');
const { hashPassword } = require('./utils/helpers');

async function completeReset() {
  console.log('🔄 COMPLETE SYSTEM RESET');
  console.log('='.repeat(50));
  
  try {
    const dataDir = path.join(__dirname, 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Create a test user
    const testUser = {
      id: 1001,
      name: 'Test User',
      email: 'test@example.com',
      password: hashPassword('password123'),
      createdAt: new Date().toISOString()
    };
    
    const files = {
      'users.json': [testUser],
      'products.json': [],
      'orders.json': [],
      'carts.json': {}
    };
    
    for (const [filename, data] of Object.entries(files)) {
      await fs.writeFile(path.join(dataDir, filename), JSON.stringify(data, null, 2));
      console.log(`✅ Created ${filename}`);
    }
    
    console.log('\n🎉 RESET COMPLETE!');
    console.log('💡 Test credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('\n🚀 Start server: npm start');
    
  } catch (error) {
    console.error('❌ RESET FAILED:', error);
  }
}

completeReset();