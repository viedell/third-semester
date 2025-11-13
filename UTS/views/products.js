const { createLayout } = require('./layout');

function productsView({ products, category, search, user }) {
  const content = `
    <div style="margin-bottom: 2rem;">
      <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; background: linear-gradient(45deg, var(--accent), #ff6b9d); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        Our Products
      </h1>
      
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
        <form method="GET" action="/products" style="display: flex; gap: 1rem; flex: 1;">
          <input 
            type="text" 
            name="search" 
            value="${search || ''}"
            placeholder="Search products..."
            style="
              flex: 1;
              padding: 0.75rem 1rem;
              background: var(--surface);
              border: 1px solid var(--border);
              border-radius: 8px;
              color: var(--text-primary);
            "
          >
          <select 
            name="category" 
            style="
              padding: 0.75rem 1rem;
              background: var(--surface);
              border: 1px solid var(--border);
              border-radius: 8px;
              color: var(--text-primary);
            "
          >
            <option value="">All Categories</option>
            <option value="Electronics" ${category === 'Electronics' ? 'selected' : ''}>Electronics</option>
            <option value="Accessories" ${category === 'Accessories' ? 'selected' : ''}>Accessories</option>
            <option value="Storage" ${category === 'Storage' ? 'selected' : ''}>Storage</option>
          </select>
          <button type="submit" class="btn">Filter</button>
        </form>
      </div>
    </div>
    
    ${!products || products.length === 0 ? `
      <div style="text-align: center; padding: 4rem 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
        <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">No products found</h2>
        <p style="color: var(--text-secondary);">Try adjusting your search or filter criteria</p>
      </div>
    ` : `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
        ${products.map(product => `
          <div class="card">
            <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=400&fit=crop'}" alt="${product.name || 'Product'}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">${product.name || 'Unnamed Product'}</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">${product.description || 'No description available'}</p>
            
            <div style="margin-bottom: 1rem;">
              ${(product.features || ['Premium Quality', 'Latest Technology']).map(feature => `
                <span style="display: inline-block; background: var(--accent-glow); color: var(--accent); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin: 0.25rem; border: 1px solid rgba(255, 45, 85, 0.3);">
                  ${feature}
                </span>
              `).join('')}
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <span style="font-size: 1.5rem; font-weight: 800; color: var(--accent);">$${product.price || '0.00'}</span>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="color: gold;">⭐</span>
                <span style="color: var(--text-secondary);">${product.rating || '4.5'} (${product.reviews || '0'})</span>
              </div>
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
              <a href="/products/${product.id}" class="btn-secondary" style="flex: 1; text-align: center; text-decoration: none; padding: 0.75rem;">
                View Details
              </a>
              <button onclick="addToCart(${product.id})" class="btn" style="flex: 1;" ${(product.stock || 0) <= 0 ? 'disabled' : ''}>
                ${(product.stock || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
            
            ${(product.stock || 0) > 0 && (product.stock || 0) < 10 ? `
              <div style="margin-top: 1rem; padding: 0.5rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px; text-align: center; color: var(--warning); font-size: 0.8rem; font-weight: 600;">
                🔥 Only ${product.stock} left in stock!
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `}
  `;
  
  return createLayout('Products', content, user);
}

module.exports = productsView;