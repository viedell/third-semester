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

// In-memory data storage (for Vercel)
let memoryData = {
    products: [],
    users: [],
    orders: [],
    categories: []
};

// Initialize data with comprehensive sample data
function initializeData() {
    // Sample products data
    memoryData.products = [
        {
            id: 1,
            name: "Quantum Protein Bar",
            description: "Advanced nutrition with quantum-infused proteins for maximum absorption. Contains nano-enhanced amino acids and smart nutrients that adapt to your body's needs.",
            price: 4.99,
            image: "https://images.unsplash.com/photo-1628149332400-91e4cac814d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Protein Meals",
            stock: 50,
            rating: 4.5,
            reviews: 128,
            features: ["Smart Nutrient Delivery", "24hr Energy", "Zero Artificial Ingredients"],
            nutrition: { calories: 220, protein: 20, carbs: 25, fat: 8 }
        },
        {
            id: 2,
            name: "Neo Vegan Burger",
            description: "Plant-based patty with lab-grown flavors that mimic authentic meat. Made with cultured plant proteins and 3D-printed texture for the perfect bite.",
            price: 12.99,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Vegan Future",
            stock: 30,
            rating: 4.8,
            reviews: 89,
            features: ["Lab-Grown Flavor", "3D Printed Texture", "100% Plant-Based"],
            nutrition: { calories: 350, protein: 25, carbs: 30, fat: 12 }
        },
        {
            id: 3,
            name: "Smart Energy Drink",
            description: "Cognitive-enhancing beverage with nootropics for mental clarity. Features neuro-adaptive compounds that improve focus based on your brain activity.",
            price: 3.49,
            image: "https://images.unsplash.com/photo-1599031628962-8d927fc56e35?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Smart Drinks",
            stock: 100,
            rating: 4.3,
            reviews: 256,
            features: ["Nootropic Enhanced", "Zero Crash", "Mental Clarity"],
            nutrition: { calories: 15, protein: 0, carbs: 3, fat: 0 }
        },
        {
            id: 4,
            name: "3D Printed Pizza",
            description: "Customizable nutrition with personalized 3D-printed ingredients. Choose your exact macro ratios and flavor profile for the perfect meal.",
            price: 16.99,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "3D Printed",
            stock: 20,
            rating: 4.7,
            reviews: 67,
            features: ["Fully Customizable", "Perfect Nutrition", "Instant Preparation"],
            nutrition: { calories: 280, protein: 18, carbs: 35, fat: 9 }
        },
        {
            id: 5,
            name: "Lab-Grown Steak",
            description: "Ethically produced cultured meat with authentic texture and taste. Grown from stem cells with zero animal harm and perfect marbling.",
            price: 24.99,
            image: "https://images.unsplash.com/photo-1588347818122-c6b08c2c9c8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Lab-Grown",
            stock: 15,
            rating: 4.9,
            reviews: 42,
            features: ["Ethically Sourced", "Perfect Marbling", "Zero Cholesterol"],
            nutrition: { calories: 320, protein: 35, carbs: 2, fat: 18 }
        },
        {
            id: 6,
            name: "Nootropic Smoothie",
            description: "Brain-boosting blend with adaptogens and superfoods. Features lion's mane, chaga, and other cognitive-enhancing mushrooms.",
            price: 6.99,
            image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Nootropic Foods",
            stock: 40,
            rating: 4.4,
            reviews: 93,
            features: ["Adaptogen Blend", "Brain Health", "Antioxidant Rich"],
            nutrition: { calories: 180, protein: 5, carbs: 35, fat: 2 }
        },
        {
            id: 7,
            name: "Solar-Powered Snack",
            description: "Nutrient-dense bars charged with solar energy for all-day vitality. Embedded with light-activated nutrient release technology.",
            price: 5.49,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Energy Boosters",
            stock: 75,
            rating: 4.2,
            reviews: 156,
            features: ["Solar Charged", "Sustained Energy", "Light-Activated"],
            nutrition: { calories: 210, protein: 12, carbs: 28, fat: 7 }
        },
        {
            id: 8,
            name: "Hydroponic Salad",
            description: "Fresh greens grown in advanced hydroponic systems for maximum nutrients. Harvested at peak freshness with enhanced vitamin content.",
            price: 9.99,
            image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            category: "Vegan Future",
            stock: 25,
            rating: 4.6,
            reviews: 78,
            features: ["Hydroponic Grown", "Vitamin Enhanced", "Zero Pesticides"],
            nutrition: { calories: 120, protein: 8, carbs: 15, fat: 4 }
        }
    ];

    // Initialize categories from products
    memoryData.categories = [...new Set(memoryData.products.map(p => p.category))];
    
    console.log('Sample data initialized with', memoryData.products.length, 'products');
}

// Helper function to save data (only works in development)
function saveData() {
    if (process.env.NODE_ENV === 'development') {
        try {
            const dataDir = path.join(__dirname, 'data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir);
            }
            fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(memoryData.products, null, 2));
            fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(memoryData.users, null, 2));
            fs.writeFileSync(path.join(dataDir, 'orders.json'), JSON.stringify(memoryData.orders, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving data (development only):', error.message);
            return false;
        }
    }
    return true;
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

app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'orders.html'));
});

app.get('/order/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'order-detail.html'));
});

app.get('/categories', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'categories.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// ==================== API ROUTES (JSON) ====================

// Products API
app.get('/api/products', (req, res) => {
    try {
        const { category, search, sort } = req.query;
        let products = [...memoryData.products];

        // Filter by category
        if (category && category !== 'All') {
            products = products.filter(p => p.category === category);
        }

        // Search by name or description
        if (search) {
            const searchLower = search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower)
            );
        }

        // Sort products
        if (sort) {
            switch (sort) {
                case 'price-low':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'name':
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'rating':
                    products.sort((a, b) => b.rating - a.rating);
                    break;
            }
        }

        res.json(products);
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

// Categories API
app.get('/api/categories', (req, res) => {
    res.json(memoryData.categories);
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
    saveData();
    
    res.status(201).json(newUser);
});

// Orders API
app.get('/api/orders', (req, res) => {
    res.json(memoryData.orders);
});

app.get('/api/orders/:id', (req, res) => {
    const order = memoryData.orders.find(o => o.id === parseInt(req.params.id));
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
});

app.post('/api/orders', (req, res) => {
    const { items, customerInfo, paymentMethod } = req.body;
    
    // Validate items and calculate total
    let total = 0;
    const orderItems = [];
    
    for (const item of items) {
        const product = memoryData.products.find(p => p.id === item.productId);
        if (!product) {
            return res.status(400).json({ error: `Product ${item.productId} not found` });
        }
        if (product.stock < item.quantity) {
            return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        }
        
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        
        orderItems.push({
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            price: product.price,
            quantity: item.quantity,
            itemTotal: parseFloat(itemTotal.toFixed(2))
        });
        
        // Update product stock in memory
        product.stock -= item.quantity;
    }
    
    const newOrder = {
        id: memoryData.orders.length > 0 ? Math.max(...memoryData.orders.map(o => o.id)) + 1 : 1,
        items: orderItems,
        customerInfo,
        paymentMethod: paymentMethod || 'credit_card',
        total: parseFloat(total.toFixed(2)),
        status: 'confirmed',
        orderNumber: 'NB' + Date.now(),
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
    };
    
    memoryData.orders.push(newOrder);
    saveData();
    
    res.status(201).json(newOrder);
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const order = memoryData.orders.find(o => o.id === parseInt(req.params.id));
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    order.updatedAt = new Date().toISOString();
    saveData();
    
    res.json(order);
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
                productImage: product.image,
                productPrice: product.price,
                itemTotal: parseFloat(itemTotal.toFixed(2))
            });
        }
    }
    
    res.json({
        items: calculatedItems,
        total: parseFloat(total.toFixed(2)),
        itemCount: calculatedItems.reduce((sum, item) => sum + item.quantity, 0)
    });
});

// Reviews API
app.get('/api/products/:id/reviews', (req, res) => {
    // Mock reviews data
    const reviews = [
        {
            id: 1,
            userName: "Tech Foodie",
            rating: 5,
            comment: "Absolutely revolutionary! The quantum protein bar kept me energized for my entire 12-hour coding session.",
            date: "2023-12-01"
        },
        {
            id: 2,
            userName: "Future Chef",
            rating: 4,
            comment: "Great taste and texture. Love the sustainable approach to food technology.",
            date: "2023-11-28"
        }
    ];
    res.json(reviews);
});

// Test endpoint to verify API is working
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working!', 
        environment: process.env.NODE_ENV || 'production',
        productsCount: memoryData.products.length,
        ordersCount: memoryData.orders.length,
        categories: memoryData.categories,
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
    console.log(`Products loaded: ${memoryData.products.length}`);
    console.log(`Categories: ${memoryData.categories.join(', ')}`);
});