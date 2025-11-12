const { createLayout } = require('./layout');
const { escapeHtml } = require('../utils/helpers');

function productsView(products) {
  const content = `
    <div class="section-header">
      <h2>All Products</h2>
      <p>Browse our complete collection of premium tech</p>
    </div>

    <div class="grid">
      ${products.map(p => `
        <div class="card" onclick="window.location.href='/product/${p.id}'">
          <img src="${p.imageUrl}" alt="${escapeHtml(p.name)}" class="card-image" loading="lazy">
          <div class="card-content">
            <div class="card-category">${escapeHtml(p.category)}</div>
            <div class="card-title">${escapeHtml(p.name)}</div>
            <div class="card-desc">${escapeHtml(p.description)}</div>
            <div class="card-footer">
              <div class="price">${p.price}</div>
              <div class="stock-badge">${p.stock} in stock</div>
            </div>
            <button class="btn" style="width: 100%; margin-top: 1rem;" onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return createLayout('Products - TechStore', content);
}

module.exports = { productsView };
