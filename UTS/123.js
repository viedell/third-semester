const { memoryStore } = require('./utils/fileHandler');
const { hashPassword, comparePassword } = require('./utils/helpers');

function testMemoryAuth() {
  console.log('🧪 TESTING MEMORY STORE AUTHENTICATION');
  console.log('='.repeat(50));
  
  // Reset memory store
  memoryStore.users = [];
  
  // Create test user in memory store
  const testUser = {
    id: 1001,
    name: 'Testuser',
    email: 'test@example.com',
    password: hashPassword('password123'),
    createdAt: new Date().toISOString()
  };
  
  memoryStore.users.push(testUser);
  
  console.log('👤 Test user created in memory store:');
  console.log('   Email:', testUser.email);
  console.log('   Password: password123');
  console.log('   Hashed:', testUser.password.substring(0, 20) + '...');
  
  console.log('\n📋 Memory store users:', memoryStore.users.length);
  
  // Test password comparison
  console.log('\n🔐 TESTING PASSWORD:');
  console.log('   Correct password:', comparePassword('password123', testUser.password));
  console.log('   Wrong password:', comparePassword('wrong', testUser.password));
  
  console.log('\n✅ MEMORY STORE AUTH TEST COMPLETE');
  console.log('💡 The memory store should work even if file system fails');
}

testMemoryAuth();