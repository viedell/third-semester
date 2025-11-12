const express = require('express');
const publicRoutes = require('./routes/publicRoutes');
const apiRoutes = require('./routes/apiRoutes');
const { initializeDataFiles } = require('./utils/fileHandler');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', publicRoutes);
app.use('/api', apiRoutes);

// Start server
initializeDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                   TECHSTORE SERVER                         ║
╠════════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                             ║
║                                                            ║
║  PUBLIC ROUTES (HTML):                                     ║
║  GET  /              → Home page                           ║
║  GET  /products      → Products listing                    ║
║  GET  /product/:id   → Single product                      ║
║  GET  /cart          → Shopping cart                       ║
║  GET  /orders        → Order history                       ║
║                                                            ║
║  API ROUTES (JSON):                                        ║
║  GET    /api/products      → All products                  ║
║  GET    /api/product/:id   → Single product                ║
║  POST   /api/products      → Create product                ║
║  GET    /api/users         → All users                     ║
║  POST   /api/users         → Create user                   ║
║  GET    /api/cart          → Get cart                      ║
║  POST   /api/cart          → Add to cart                   ║
║  PATCH  /api/cart          → Update cart quantity          ║
║  DELETE /api/cart/:id      → Remove from cart              ║
║  GET    /api/orders        → All orders                    ║
║  POST   /api/orders        → Create order (checkout)       ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
});

