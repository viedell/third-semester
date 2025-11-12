const { createLayout } = require('./layout');
const { escapeHtml } = require('../utils/helpers');

function cartView(cartItems, total) {
  const content = cartItems.length === 0 ? `
    <div style="text-align: center; padding: 4rem 2rem;">
      <h1>Your Cart is Empty</h1>
      <p style="color: var(--text-muted); font-size: 1.2rem; margin: 1rem 0 2rem;">
        Add some amazing products to get started!
      </p>
      <a href="/products" class="btn">Browse Products</a>
    </div>
  ` : `
    <h1>Shopping Cart</h1>
    <p style="color: var(--text-muted); margin-bottom: 2rem;">${cartItems.length} items in your cart</p>

    <div style="display: grid; gap: 1.5rem;">
      ${cartItems.map(item => `
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; display: flex; gap: 1.5rem; align-items: center;">
          <img src="${item.product.imageUrl}" alt="${escapeHtml(item.product.name)}" 
               style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
          
          <div style="flex: 1;">
            <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">
              ${escapeHtml(item.product.name)}
            </div>
            <div style="color: var(--text-muted);">
              $${item.product.price} × ${item.quantity}
            </div>
          </div>
          
          <div style="text-align: right;">
            <div class="price" style="font-size: 1.5rem;">
              $${(item.product.price * item.quantity).toFixed(2)}
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="background: var(--surface); border: 2px solid var(--accent); border-radius: 12px; padding: 2rem; margin-top: 2rem; text-align: right;">
      <div style="font-size: 2rem; font-weight: 800; color: var(--accent); margin-bottom: 1.5rem;">
        Total: $${total.toFixed(2)}
      </div>
      <div style="display: flex; gap: 1rem; justify-content: flex-end;">
        <a href="/products" class="btn btn-secondary">Continue Shopping</a>
        <button class="btn" onclick="checkout()">Proceed to Checkout</button>
      </div>
    </div>

    <script>
      async function checkout() {
        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          
          if (res.ok) {
            const order = await res.json();
            showToast('✓ Order placed successfully!');
            setTimeout(() => window.location.href = '/orders', 1500);
          } else {
            showToast('Error placing order');
          }
        } catch (e) {
          showToast('Network error');
        }
      }
    </script>
  `;

  return createLayout('Shopping Cart - TechStore', content);
}

module.exports = { cartView };