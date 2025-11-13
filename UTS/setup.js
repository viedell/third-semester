const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

async function setupDataDirectory() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('✓ Data directory created');
    
    // Create empty data files
    const files = {
      'users.json': [],
      'products.json': [],
      'orders.json': [],
      'carts.json': {}
    };
    
    for (const [filename, data] of Object.entries(files)) {
      const filepath = path.join(DATA_DIR, filename);
      try {
        await fs.access(filepath);
        console.log(`✓ ${filename} already exists`);
      } catch {
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        console.log(`✓ Created ${filename}`);
      }
    }
    
    console.log('✓ Setup completed successfully!');
  } catch (error) {
    console.error('✗ Setup failed:', error);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDataDirectory();
}

module.exports = setupDataDirectory;