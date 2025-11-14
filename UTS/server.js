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

// In-memory data storage (for Vercel)
let memoryData = {
    products: [],
    users: [],
    orders: []
};

// Initialize data - try to read from files, fallback to sample data
function initializeData() {
    // Sample products data
    const sampleProducts = [
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

    // Try to read from files in development, use sample data in production
    if (process.env.NODE_ENV === 'development' && fs.existsSync(productsFile)) {
        try {
            memoryData.products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
            memoryData.users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
            memoryData.orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
            console.log('Data loaded from files');
        } catch (error) {
            console.log('Error reading data files, using sample data:', error.message);
            memoryData.products = sampleProducts;
        }
    } else {
        console.log('Using in-memory sample data');
        memoryData.products = sampleProducts;
    }
}

// Helper function to save data (only works in development)
function saveData() {
    if (process.env.NODE_ENV === 'development') {
        try {
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir);
            }
            fs.writeFileSync(productsFile, JSON.stringify(memoryData.products, null, 2));
            fs.writeFileSync(usersFile, JSON.stringify(memoryData.users, null, 2));
            fs.writeFileSync(ordersFile, JSON.stringify(memoryData.orders, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving data (development only):', error.message);
            return false;
        }
    }
    return true; // In production, we just return true since we can't save
}

// Initialize data
initializeData();

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
    try {
        console.log('Sending products:', memoryData.products.length);
        res.json(memoryData.products);
    } catch (error) {
        console.error('Error in /api/products:', error);
        res.status(500).json({ error: 'Failed to load products' });
    }
});

app.get('/api/products/:id', (req, res) => {
    try {
        const product = memoryData.products.find(p => p.id === parseInt(req.params.id));
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Error in /api/products/:id:', error);
        res.status(500).json({ error: 'Failed to load product' });
    }
});

// Users API
app.get('/api/users', (req, res) => {
    res.json(memoryData.users);
});

app.post('/api/users', (req, res) => {
    const newUser = {
        id: memoryData.users.length > 0 ? Math.max(...memoryData.users.map(u => u.id)) + 1 : 1,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    memoryData.users.push(newUser);
    saveData(); // This will only work in development
    
    res.status(201).json(newUser);
});

// Orders API
app.get('/api/orders', (req, res) => {
    res.json(memoryData.orders);
});

app.post('/api/orders', (req, res) => {
    const { items, customerInfo } = req.body;
    
    // Validate items and calculate total
    let total = 0;
    for (const item of items) {
        const product = memoryData.products.find(p => p.id === item.productId);
        if (!product) {
            return res.status(400).json({ error: `Product ${item.productId} not found` });
        }
        if (product.stock < item.quantity) {
            return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        }
        total += product.price * item.quantity;
        
        // Update product stock in memory
        product.stock -= item.quantity;
    }
    
    const newOrder = {
        id: memoryData.orders.length > 0 ? Math.max(...memoryData.orders.map(o => o.id)) + 1 : 1,
        items,
        customerInfo,
        total: parseFloat(total.toFixed(2)),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    memoryData.orders.push(newOrder);
    saveData(); // This will only work in development
    
    res.status(201).json(newOrder);
});

// Cart API
app.post('/api/cart/calculate', (req, res) => {
    const { items } = req.body;
    
    let total = 0;
    const calculatedItems = [];
    
    for (const item of items) {
        const product = memoryData.products.find(p => p.id === item.productId);
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

// Test endpoint to verify API is working
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working!', 
        environment: process.env.NODE_ENV || 'production',
        productsCount: memoryData.products.length,
        ordersCount: memoryData.orders.length,
        timestamp: new Date().toISOString() 
    });
});

// Health check endpoint for Vercel
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`NexusBite Marketplace running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Test API: http://localhost:${PORT}/api/test`);
    console.log(`Products loaded: ${memoryData.products.length}`);
});