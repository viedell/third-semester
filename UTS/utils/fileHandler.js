const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

async function initializeDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    const files = {
      'users.json': [],
      'products.json': [],
      'orders.json': [],
      'cart.json': []
    };

    for (const [filename, defaultData] of Object.entries(files)) {
      const filepath = path.join(DATA_DIR, filename);
      try {
        await fs.access(filepath);
      } catch {
        await fs.writeFile(filepath, JSON.stringify(defaultData, null, 2));
      }
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

async function readJSON(filename) {
  const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
  return JSON.parse(data);
}

async function writeJSON(filename, data) {
  await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

module.exports = {
  initializeDataFiles,
  readJSON,
  writeJSON
};

