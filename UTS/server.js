const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Data file paths
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const productsFile = path.join(dataDir, 'products.json');
const ordersFile = path.join(dataDir, 'orders.json');

// Initialize data files if they don't exist
function initializeDataFiles() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
    }

    if (!fs.existsSync(productsFile)) {
        const initialProducts = [
            {
                id: 1,
                name: "Quantum Protein Bar",
                description: "Advanced nutrition with quantum-infused proteins for maximum absorption.",
                price: 4.99,
                image: "https://images.unsplash.com/photo-1628149332400-91e4cac814d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "Protein Meals",
                stock: 50
            },
            {
                id: 2,
                name: "Neo Vegan Burger",
                description: "Plant-based patty with lab-grown flavors that mimic authentic meat.",
                price: 12.99,
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "Vegan Future",
                stock: 30
            },
            {
                id: 3,
                name: "Smart Energy Drink",
                description: "Cognitive-enhancing beverage with nootropics for mental clarity.",
                price: 3.49,
                image: "https://images.unsplash.com/photo-1599031628962-8d927fc56e35?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "Smart Drinks",
                stock: 100
            },
            {
                id: 4,
                name: "3D Printed Pizza",
                description: "Customizable nutrition with personalized 3D-printed ingredients.",
                price: 16.99,
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "3D Printed",
                stock: 20
            },
            {
                id: 5,
                name: "Lab-Grown Steak",
                description: "Ethically produced cultured meat with authentic texture and taste.",
                price: 24.99,
                image: "https://images.unsplash.com/photo-1588347818122-c6b08c2c9c8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "Lab-Grown",
                stock: 15
            },
            {
                id: 6,
                name: "Nootropic Smoothie",
                description: "Brain-boosting blend with adaptogens and superfoods.",
                price: 6.99,
                image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "Nootropic Foods",
                stock: 40
            }
        ];
        fs.writeFileSync(productsFile, JSON.stringify(initialProducts, null, 2));
    }

    if (!fs.existsSync(ordersFile)) {
        fs.writeFileSync(ordersFile, JSON.stringify([], null, 2));
    }
}

// Helper functions to read/write JSON files
function readJSON(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
        return false;
    }
}

// Initialize data files
initializeDataFiles();

// ==================== PUBLIC WEBSITE ROUTES (HTML) ====================

// Serve HTML files from views directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'product.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

// ==================== API ROUTES (JSON) ====================

// Products API
app.get('/api/products', (req, res) => {
    const products = readJSON(productsFile);
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const products = readJSON(productsFile);
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
});

// Users API
app.get('/api/users', (req, res) => {
    const users = readJSON(usersFile);
    res.json(users);
});

app.post('/api/users', (req, res) => {
    const users = readJSON(usersFile);
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    if (writeJSON(usersFile, users)) {
        res.status(201).json(newUser);
    } else {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Orders API
app.get('/api/orders', (req, res) => {
    const orders = readJSON(ordersFile);
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const orders = readJSON(ordersFile);
    const products = readJSON(productsFile);
    
    const { items, customerInfo } = req.body;
    
    // Validate items and calculate total
    let total = 0;
    for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
            return res.status(400).json({ error: `Product ${item.productId} not found` });
        }
        if (product.stock < item.quantity) {
            return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        }
        total += product.price * item.quantity;
    }
    
    const newOrder = {
        id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
        items,
        customerInfo,
        total: parseFloat(total.toFixed(2)),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Update product stock
    for (const item of items) {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
            products[productIndex].stock -= item.quantity;
        }
    }
    
    orders.push(newOrder);
    
    if (writeJSON(ordersFile, orders) && writeJSON(productsFile, products)) {
        res.status(201).json(newOrder);
    } else {
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Cart API
app.post('/api/cart/calculate', (req, res) => {
    const products = readJSON(productsFile);
    const { items } = req.body;
    
    let total = 0;
    const calculatedItems = [];
    
    for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            calculatedItems.push({
                ...item,
                productName: product.name,
                productPrice: product.price,
                itemTotal: parseFloat(itemTotal.toFixed(2))
            });
        }
    }
    
    res.json({
        items: calculatedItems,
        total: parseFloat(total.toFixed(2))
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`NexusBite Marketplace running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});