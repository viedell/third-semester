// Product detail page functionality
async function loadProductDetail() {
    const pathParts = window.location.pathname.split('/');
    const productId = parseInt(pathParts[pathParts.length - 1]);
    
    if (!productId) {
        document.getElementById('productDetail').innerHTML = '<p>Product not found</p>';
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        const product = await response.json();
        renderProductDetail(product);
    } catch (error) {
        document.getElementById('productDetail').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h2>Product Not Found</h2>
                <p>The product you're looking for doesn't exist.</p>
                <a href="/" style="color: var(--primary-red);">Return to Home</a>
            </div>
        `;
    }
}

function renderProductDetail(product) {
    const productDetail = document.getElementById('productDetail');
    
    productDetail.innerHTML = `
        <div class="product-detail">
            <div class="product-detail-image" style="background-image: url('${product.image}')"></div>
            <div class="product-detail-info">
                <h1 class="product-detail-title">${product.name}</h1>
                <p class="product-detail-description">${product.description}</p>
                <div class="product-detail-price">$${product.price.toFixed(2)}</div>
                <div class="product-detail-stock">In stock: ${product.stock} units</div>
                <div class="product-detail-actions">
                    <div class="product-detail-quantity">
                        <div class="quantity-controls-large">
                            <button class="quantity-btn-large minus" onclick="updateProductQuantity(false)">-</button>
                            <span class="quantity-large" id="productQuantity">1</span>
                            <button class="quantity-btn-large plus" onclick="updateProductQuantity(true)">+</button>
                        </div>
                        <button class="add-to-cart-large" onclick="addProductToCart(${product.id})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateProductQuantity(isPlus) {
    const quantityElement = document.getElementById('productQuantity');
    let quantity = parseInt(quantityElement.textContent);
    
    if (isPlus) {
        quantity++;
    } else {
        if (quantity > 1) quantity--;
    }
    
    quantityElement.textContent = quantity;
}

function addProductToCart(productId) {
    const quantityElement = document.getElementById('productQuantity');
    const quantity = parseInt(quantityElement.textContent);
    
    // Use the main.js addToCart function
    const product = products.find(p => p.id === productId);
    if (!product) return;

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
    showFeedback(`${product.name} added to cart!`);
    
    // Reset quantity
    document.getElementById('productQuantity').textContent = '1';
}

// Load product detail when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProductDetail);
} else {
    loadProductDetail();
}