const { createLayout } = require('./layout');

function homeView({ featuredProducts, user }) {
  const content = `
    <div style="text-align: center; margin-bottom: 4rem;">
      <h1 style="font-size: 3.5rem; font-weight: 900; margin-bottom: 1rem; background: linear-gradient(45deg, var(--accent), #ff6b9d); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        FUTURE TECH AWAITS
      </h1>
      <p style="font-size: 1.25rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 2rem;">
        Discover cutting-edge technology and innovative gadgets that redefine what's possible
      </p>
      <a href="/products" class="btn" style="padding: 1rem 2rem; font-size: 1.1rem;">
        Explore Products 🚀
      </a>
    </div>
    
    <div style="margin-bottom: 4rem;">
      <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 2rem; text-align: center;">Featured Products</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        ${featuredProducts.map(product => `
          <div class="card" style="text-align: center;">
            <img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">${product.name}</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">${product.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <span style="font-size: 1.5rem; font-weight: 800; color: var(--accent);">$${product.price}</span>
              <span style="color: var(--text-muted);">⭐ ${product.rating} (${product.reviews})</span>
            </div>
            <button onclick="addToCart(${product.id})" class="btn" style="width: 100%;">
              Add to Cart
            </button>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div style="background: var(--surface); border-radius: 12px; padding: 3rem; text-align: center;">
      <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 1rem;">Why Choose TechStore?</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem;">
        <div>
          <div style="font-size: 2rem; margin-bottom: 1rem;">🚀</div>
          <h3 style="font-weight: 700; margin-bottom: 0.5rem;">Cutting-Edge Tech</h3>
          <p style="color: var(--text-secondary);">Latest innovations and future technology</p>
        </div>
        <div>
          <div style="font-size: 2rem; margin-bottom: 1rem;">🔒</div>
          <h3 style="font-weight: 700; margin-bottom: 0.5rem;">Secure Shopping</h3>
          <p style="color: var(--text-secondary);">Your data and payments are protected</p>
        </div>
        <div>
          <div style="font-size: 2rem; margin-bottom: 1rem;">⚡</div>
          <h3 style="font-weight: 700; margin-bottom: 0.5rem;">Fast Delivery</h3>
          <p style="color: var(--text-secondary);">Quick shipping across the globe</p>
        </div>
      </div>
    </div>
  `;
  
  return createLayout('Home', content, user);
}

module.exports = homeView;