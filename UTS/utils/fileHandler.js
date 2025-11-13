const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// In-memory storage for Vercel/serverless environments
let memoryStore = {
  users: [],
  products: [],
  orders: [],
  cart: []
};

let isInitialized = false;

const defaultProducts = [
  {
    "id": 1,
    "name": "Premium Laptop",
    "price": 999.99,
    "stock": 10,
    "description": "High-performance laptop with cutting-edge specs",
    "category": "Electronics",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pricebook.co.id%2Farticle%2Fmarket_issue%2F6934%2Flaptop-murah-spek-tinggi&psig=AOvVaw04rCI0lDG2r2fcF5XJ_uMr&ust=1763064231338000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCMC0mZy07ZADFQAAAAAdAAAAABAR"
  },
  {
    "id": 2,
    "name": "Wireless Mouse",
    "price": 29.99,
    "stock": 50,
    "description": "Ergonomic wireless mouse with precision tracking",
    "category": "Accessories",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fdoran.id%2Frekomendasi-mouse-wireless-terbaik%2F&psig=AOvVaw0k4Dp0EDWakW2d9S-gpcdw&ust=1763064270628000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCMj9qK-07ZADFQAAAAAdAAAAABAE"
  },
  {
    "id": 3,
    "name": "Mechanical Keyboard",
    "price": 79.99,
    "stock": 30,
    "description": "RGB mechanical keyboard with premium switches",
    "category": "Accessories",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fblossomzones.com%2Fshop%2Fkeyboard%2Fimperion-mech-7-rgb-mechanical-keyboard%2F&psig=AOvVaw2tNkapmlm6DAVk-uFyeXGi&ust=1763064293046000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCIj2y7m07zADFQAAAAAdAAAAABAE"
  },
  {
    "id": 4,
    "name": "27\" 4K Monitor",
    "price": 349.99,
    "stock": 15,
    "description": "4K UHD monitor with HDR support and thin bezels",
    "category": "Electronics",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.philips.co.id%2Fid%2Fc-p%2F276E8VJSB_00%2Fmonitor-lcd-ultra-hd-4k&psig=AOvVaw3eqTl3cBLfUQVXpaM2jkqe&ust=1763064322818000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLjd2Me07zADFQAAAAAdAAAAABAK"
  },
  {
    "id": 5,
    "name": "USB-C Hub",
    "price": 49.99,
    "stock": 40,
    "description": "Multi-port USB-C hub with fast charging",
    "category": "Accessories",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.ubuy.co.id%2Fid%2Fproduct%2F3TNJJ5EQE-usb-c-hub-with-hard-drive-enclosure-8-in-1-usb-c-hub-adapter-with-2-5-inch-m-2-sata-ssd-external-hard-drive-enclosure-4k-hdmi-2-usb-3-0-ports-sdtf%3Fsrsltid%3DAfmBOoq9kDivPL1xaWpmpM28V4MR0lbxp0chje2wEgt4_edHe3efwK6a&psig=AOvVaw2fTvufzV2jObJ7-KLRvXS-&ust=1763064353682000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLigtda07zADFQAAAAAdAAAAABAE"
  },
  {
    "id": 6,
    "name": "Webcam HD",
    "price": 89.99,
    "stock": 25,
    "description": "Crystal clear 1080p webcam for streaming and video calls",
    "category": "Electronics",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fjete.id%2Fproduct%2Fwebcam-jete-w21%2F&psig=AOvVaw0fECRZUS8J_FnDVjRgCZu3&ust=1763064376807000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLD7vOG07zADFQAAAAAdAAAAABAE"
  },
  {
    "id": 7,
    "name": "Noise-Cancelling Headphones",
    "price": 199.99,
    "stock": 18,
    "description": "Comfortable over-ear headphones with active noise-canceling",
    "category": "Audio",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.tokopedia.com%2Fblog%2Ftop-rekomendasi-headphone-tek%2F%3Futm_source%3Dgoogle%26utm_medium%3Dorganic&psig=AOvVaw3xuge89OGFViThQ66wi_YZ&ust=1763064394936000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCICZxOu07zADFQAAAAAdAAAAABAE"
  },
  {
    "id": 8,
    "name": "Portable SSD 1TB",
    "price": 149.99,
    "stock": 32,
    "description": "Fast NVMe portable SSD, USB-C, pocket-sized",
    "category": "Storage",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fsinarphoto.com%2FProductInfo.asp%3Fid%3D6297&psig=AOvVaw2qGcEdXvWTGaralNrwp7EI&ust=1763064418138000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCIjenPW07zADFQAAAAAdAAAAABAE"
  },
  {
    "id": 9,
    "name": "Smartphone Gimbal",
    "price": 119.99,
    "stock": 22,
    "description": "3-axis gimbal stabilizer for smooth mobile footage",
    "category": "Accessories",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fplazakamera.com%2Fshop%2Fzhiyun-smooth-5-smartphone-gimbal%2F%3Fsrsltid%3DAfmBOopJyUZ5euf4mPmN9NJ6YTKtUelokJQbus8xa7RHeTKPJ0kf4Ayz&psig=AOvVaw2BHKtr30RZ21B2wgsmZdm4&ust=1763064441572000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCOi0qIC17ZADFQAAAAAdAAAAABAE"
  },
  {
    "id": 10,
    "name": "Bluetooth Speaker",
    "price": 59.99,
    "stock": 45,
    "description": "Portable Bluetooth speaker with rich bass and long battery",
    "category": "Audio",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.my-best.com%2F86711&psig=AOvVaw199UUm0YPxzKE0QR9KMlQD&ust=1763064461311000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTJCj1Im17ZADFQAAAAAdAAAAABAE"
  },
  {
    "id": 11,
    "name": "USB Microphone",
    "price": 129.99,
    "stock": 20,
    "description": "Studio-quality USB microphone for streaming and podcasts",
    "category": "Audio",
    "imageUrl": "https://source.unsplash.com/800x600/?microphone"
  },
  {
    "id": 12,
    "name": "Ergonomic Laptop Stand",
    "price": 39.99,
    "stock": 60,
    "description": "Aluminum stand to elevate laptop for better posture",
    "category": "Accessories",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Frow.hyperx.com%2Fid%2Fproducts%2Fhyperx-solocast-usb-microphone&psig=AOvVaw02kWRoFqbaLcZWioWP3JQO&ust=1763064479163000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCPCEj5K17ZADFQAAAAAdAAAAABAE"
  },
  {
    "id": 13,
    "name": "Gaming Mouse Pad",
    "price": 24.99,
    "stock": 100,
    "description": "Large surface mouse pad with stitched edges and non-slip base",
    "category": "Accessories",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.logitechg.com%2Fid-id%2Fproducts%2Fgaming-mouse-pads%2Fg440-hard-gaming-mouse-pad.html&psig=AOvVaw0vE1mm2pcThC7svpD2Od5J&ust=1763064493273000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCMjW8Zi17ZADFQAAAAAdAAAAABAE"
  },
  {
    "id": 14,
    "name": "USB-C to HDMI Adapter",
    "price": 19.99,
    "stock": 120,
    "description": "Simple adapter for connecting laptops to external displays",
    "category": "Accessories",
    "imageUrl": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fhikvisioncctv.co.id%2F%3Fv%3D107801641001450&psig=AOvVaw0kDxjH_WkSdElu7bcVkEIp&ust=1763064511603000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCKCK2KG17ZADFQAAAAAdAAAAABAE"
  }
];

async function initializeDataFiles() {
  if (isInitialized) return;
  
  try {
    // Try to create data directory for local development
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    const files = {
      'users.json': [],
      'products.json': defaultProducts,
      'orders.json': [],
      'cart.json': []
    };

    // Try to use file system (local development)
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
    // Fallback to in-memory storage (Vercel/serverless)
    console.log('✓ Using in-memory storage (serverless)');
    memoryStore.products = defaultProducts;
  }
  
  isInitialized = true;
}

async function readJSON(filename) {
  try {
    // Try file system first (local development)
    const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Fallback to in-memory storage (Vercel/serverless)
    const key = filename.replace('.json', '');
    return memoryStore[key] || [];
  }
}

async function writeJSON(filename, data) {
  try {
    // Try file system first (local development)
    await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  } catch (error) {
    // Fallback to in-memory storage (Vercel/serverless)
    const key = filename.replace('.json', '');
    memoryStore[key] = data;
  }
}

module.exports = {
  initializeDataFiles,
  readJSON,
  writeJSON
};