// Global cart state
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// DOM elements
const productsGrid = document.getElementById('productsGrid');
const cartIcon = document.getElementById('cartIcon');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartCountElement = document.querySelector('.cart-count');
const categoryList = document.getElementById('categoryList');

// Initialize the app
async function init() {
    await loadProducts();
    renderCategories();
    renderProducts();
    updateCart();
    setupEventListeners();
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
        products = [];
    }
}

// Render categories
function renderCategories() {
    if (!categoryList) return;
    
    const categories = ['All', ...new Set(products.map(p => p.category))];
    
    categoryList.innerHTML = categories.map(category => `
        <div class="category-item ${category === 'All' ? 'active' : ''}" 
             onclick="filterByCategory('${category}')">
            ${category}
        </div>
    `).join('');
}

// Render products to the grid
function renderProducts(filteredProducts = products) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image" style="background-image: url('${product.image}')"></div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-id="${product.id}">-</button>
                        <span class="quantity" data-id="${product.id}">1</span>
                        <button class="quantity-btn plus" data-id="${product.id}">+</button>
                    </div>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter products by category
function filterByCategory(category) {
    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
    event.target.classList.add('active');
    
    if (category === 'All') {
        renderProducts(products);
    } else {
        const filtered = products.filter(product => product.category === category);
        renderProducts(filtered);
    }
}

// Search products
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm) {
        const filtered = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
        renderProducts(filtered);
    } else {
        renderProducts(products);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Cart icon click
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartModal.classList.add('open');
            overlay.classList.add('active');
        });
    }

    // Close cart
    if (closeCart) {
        closeCart.addEventListener('click', closeCartModal);
    }
    if (overlay) {
        overlay.addEventListener('click', closeCartModal);
    }

    // Add to cart buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        }
        
        // Quantity buttons
        if (e.target.classList.contains('quantity-btn')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const isPlus = e.target.classList.contains('plus');
            updateQuantity(productId, isPlus);
        }
        
        // Remove item from cart
        if (e.target.classList.contains('remove-item')) {
            const productId = parseInt(e.target.closest('.remove-item').getAttribute('data-id'));
            removeFromCart(productId);
        }
    });
}

// Close cart modal
function closeCartModal() {
    cartModal.classList.remove('open');
    overlay.classList.remove('active');
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const quantityElement = document.querySelector(`.quantity[data-id="${productId}"]`);
    const quantity = parseInt(quantityElement.textContent);
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    updateCart();
    resetQuantity(productId);
    
    // Show feedback
    showFeedback(`${product.name} added to cart!`);
}

// Update product quantity in product card
function updateQuantity(productId, isPlus) {
    const quantityElement = document.querySelector(`.quantity[data-id="${productId}"]`);
    let quantity = parseInt(quantityElement.textContent);
    
    if (isPlus) {
        quantity++;
    } else {
        if (quantity > 1) quantity--;
    }
    
    quantityElement.textContent = quantity;
}

// Reset quantity in product card to 1
function resetQuantity(productId) {
    const quantityElement = document.querySelector(`.quantity[data-id="${productId}"]`);
    if (quantityElement) {
        quantityElement.textContent = '1';
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Update cart UI
function updateCart() {
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
    
    // Update cart total
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (cartTotalElement) {
        cartTotalElement.textContent = `$${cartTotal.toFixed(2)}`;
    }
    
    // Update cart items
    if (cartItems) {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            return;
        }
        
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-image" style="background-image: url('${item.image}')"></div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItemElement);
        });
    }
}

// Checkout function
async function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const customerInfo = {
        name: prompt('Enter your name:'),
        email: prompt('Enter your email:'),
        address: prompt('Enter your delivery address:')
    };

    if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
        alert('All fields are required for checkout!');
        return;
    }

    try {
        const orderData = {
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity
            })),
            customerInfo
        };

        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const order = await response.json();
            alert(`Order placed successfully! Order ID: ${order.id}\nTotal: $${order.total}`);
            cart = [];
            updateCart();
            closeCartModal();
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Error placing order. Please try again.');
    }
}

// Show feedback message
function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary-red);
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: var(--accent-glow);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 300);
    }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}