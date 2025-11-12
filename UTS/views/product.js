const { createLayout } = require('./layout');
const { escapeHtml } = require('../utils/helpers');

function productView(product) {
  const content = `
    <div style="max-width: 1000px; margin: 2rem auto;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start;">
        <div>
          <img src="${product.imageUrl}" alt="${escapeHtml(product.name)}" 
               style="width: 100%; border-radius: 12px; border: 1px solid var(--border);">
        </div>
        
        <div>
          <div style="color: var(--accent); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem;">
            ${escapeHtml(product.category)}
          </div>
          <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">${escapeHtml(product.name)}</h1>
          <div class="price" style="font-size: 2rem; margin-bottom: 1.5rem;">$${product.price}</div>
          
          <p style="color: var(--text-muted); font-size: 1.1rem; line-height: 1.8; margin-bottom: 2rem;">
            ${escapeHtml(product.description)}
          </p>
          
          <div style="background: var(--surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: var(--text-muted);">Availability:</span>
              <span style="color: var(--accent); font-weight: 600;">${product.stock} in stock</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Category:</span>
              <span style="font-weight: 600;">${escapeHtml(product.category)}</span>
            </div>
          </div>
          
          <div style="display: flex; gap: 1rem;">
            <button class="btn" style="flex: 1;" onclick="addToCart(${product.id})">Add to Cart</button>
            <a href="/products" class="btn btn-secondary">Back to Products</a>
          </div>
        </div>
      </div>
    </div>
  `;

  return createLayout(`${product.name} - TechStore`, content);
}

module.exports = { productView };