const { readJSON } = require('./utils/fileHandler');

async function debugUsers() {
  console.log('🔍 DEBUGGING USERS DATABASE');
  console.log('='.repeat(60));
  
  try {
    const users = await readJSON('users.json');
    console.log(`📊 Total users: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`👤 USER ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password Hash: ${user.password ? user.password.substring(0, 30) + '...' : '❌ MISSING'}`);
      console.log(`   Password Length: ${user.password ? user.password.length : 'N/A'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    console.log('💡 ANALYSIS:');
    console.log('   - Password should be 64 characters (SHA256 hash)');
    console.log('   - Email should be properly formatted');
    console.log('   - No duplicate emails');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugUsers();