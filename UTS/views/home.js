const { createLayout } = require('./layout');
const { escapeHtml } = require('../utils/helpers');

function homeView(products) {
  const content = `
    <div class="hero">
      <h1>Premium Tech Products</h1>
      <p>Discover cutting-edge technology with style. Curated selection of the finest tech products for modern professionals.</p>
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
              <button class="btn" onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return createLayout('TechStore - Premium Tech Products', content);
}

module.exports = { homeView };