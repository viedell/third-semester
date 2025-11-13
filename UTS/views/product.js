const { createLayout } = require('./layout');

function productView({ product, user }) {
  const content = `
    <div style="max-width: 1200px; margin: 0 auto;">
      <a href="/products" style="display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); text-decoration: none; margin-bottom: 2rem; padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: 6px;">
        ← Back to Products
      </a>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-bottom: 4rem;">
        <div>
          <img 
            src="${product.imageUrl}" 
            alt="${product.name}" 
            style="width: 100%; height: 400px; object-fit: cover; border-radius: 12px; border: 1px solid var(--border);"
          >
        </div>
        
        <div>
          <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.2;">
            ${product.name}
          </h1>
          
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: gold; font-size: 1.25rem;">⭐</span>
              <span style="font-weight: 600; font-size: 1.1rem;">${product.rating}</span>
              <span style="color: var(--text-secondary);">(${product.reviews} reviews)</span>
            </div>
            <span style="color: var(--text-muted);">•</span>
            <span style="color: var(--success); font-weight: 600;">
              ${product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
            </span>
          </div>
          
          <p style="color: var(--text-secondary); font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem;">
            ${product.description}
          </p>
          
          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">
              Key Features:
            </h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${product.features.map(feature => `
                <span style="
                  display: inline-block;
                  background: var(--accent-glow);
                  color: var(--accent);
                  padding: 0.5rem 1rem;
                  border-radius: 6px;
                  font-size: 0.9rem;
                  font-weight: 500;
                  border: 1px solid rgba(255, 45, 85, 0.3);
                ">
                  ${feature}
                </span>
              `).join('')}
            </div>
          </div>
          
          <div style="background: var(--surface); border-radius: 12px; padding: 2rem; border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
              <div>
                <div style="font-size: 2rem; font-weight: 800; color: var(--accent);">
                  $${product.price}
                </div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">
                  Free shipping • 30-day returns
                </div>
              </div>
              
              <div style="text-align: right;">
                <div style="font-size: 0.9rem; color: var(--text-secondary);">Category</div>
                <div style="font-weight: 600; color: var(--text-primary);">${product.category}</div>
              </div>
            </div>
            
            ${product.stock > 0 ? `
              <div style="display: flex; gap: 1rem;">
                <button 
                  onclick="addToCart(${product.id})" 
                  class="btn"
                  style="flex: 1; padding: 1rem 2rem; font-size: 1.1rem;"
                >
                  Add to Cart 🛒
                </button>
                <button 
                  onclick="buyNow(${product.id})" 
                  class="btn"
                  style="flex: 1; padding: 1rem 2rem; font-size: 1.1rem; background: linear-gradient(45deg, var(--accent), #ff6b9d);"
                >
                  Buy Now ⚡
                </button>
              </div>
            ` : `
              <button 
                disabled
                style="
                  width: 100%;
                  padding: 1rem 2rem;
                  background: var(--text-muted);
                  color: var(--text-primary);
                  border: none;
                  border-radius: 8px;
                  font-size: 1.1rem;
                  cursor: not-allowed;
                "
              >
                Out of Stock
              </button>
            `}
          </div>
        </div>
      </div>
      
      <div style="background: var(--surface); border-radius: 12px; padding: 2rem; border: 1px solid var(--border);">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem;">Product Details</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
          <div>
            <h3 style="font-weight: 600; margin-bottom: 0.5rem; color: var(--text-secondary);">Availability</h3>
            <p style="color: var(--text-primary); font-weight: 500;">
              ${product.stock} units in stock
            </p>
          </div>
          
          <div>
            <h3 style="font-weight: 600; margin-bottom: 0.5rem; color: var(--text-secondary);">Category</h3>
            <p style="color: var(--text-primary); font-weight: 500;">${product.category}</p>
          </div>
          
          <div>
            <h3 style="font-weight: 600; margin-bottom: 0.5rem; color: var(--text-secondary);">Warranty</h3>
            <p style="color: var(--text-primary); font-weight: 500;">2 Years Limited</p>
          </div>
          
          <div>
            <h3 style="font-weight: 600; margin-bottom: 0.5rem; color: var(--text-secondary);">Support</h3>
            <p style="color: var(--text-primary); font-weight: 500;">24/7 Tech Support</p>
          </div>
        </div>
      </div>
    </div>
    
    <script>
      async function buyNow(productId) {
        // Add to cart and redirect to checkout
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 })
          });
          
          if (res.status === 401) {
            showToast('Please login to continue', 'error');
            setTimeout(() => {
              window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
            }, 1500);
            return;
          }
          
          if (res.ok) {
            showToast('Redirecting to checkout...');
            setTimeout(() => {
              window.location.href = '/cart';
            }, 1000);
          } else {
            const err = await res.json();
            showToast(err.error || 'Error adding to cart', 'error');
          }
        } catch (e) {
          showToast('Network error', 'error');
        }
      }
    </script>
  `;
  
  return createLayout(product.name, content, user);
}

module.exports = productView;