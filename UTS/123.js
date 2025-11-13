const fs = require('fs').promises;
const path = require('path');

async function emergencyReset() {
  console.log('🚨 EMERGENCY RESET - Fixing User Database');
  console.log('='.repeat(50));
  
  try {
    const dataDir = path.join(__dirname, 'data');
    
    // Force create data directory
    await fs.mkdir(dataDir, { recursive: true });
    console.log('✅ Data directory created/verified');
    
    // Create EMPTY users array
    const users = [];
    await fs.writeFile(path.join(dataDir, 'users.json'), JSON.stringify(users, null, 2));
    console.log('✅ users.json reset to empty array');
    
    // Verify the file was created
    const usersData = await fs.readFile(path.join(dataDir, 'users.json'), 'utf-8');
    const parsedUsers = JSON.parse(usersData);
    console.log(`✅ Verification: users.json contains ${parsedUsers.length} users`);
    
    console.log('\n🎉 EMERGENCY RESET COMPLETE!');
    console.log('💡 Now you can:');
    console.log('   1. Run: npm start');
    console.log('   2. Go to: /auth/register');
    console.log('   3. Register with: a@a.com / password123');
    console.log('   4. It should work now!');
    
  } catch (error) {
    console.error('❌ EMERGENCY RESET FAILED:', error);
  }
}

emergencyReset();