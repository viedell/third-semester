const { createLayout } = require('./layout');

function cartView({ user }) {
  const content = `
    <div style="max-width: 1000px; margin: 0 auto;">
      <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 2rem; background: linear-gradient(45deg, var(--accent), #ff6b9d); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        Shopping Cart
      </h1>
      
      <div id="cart-content">
        <div style="text-align: center; padding: 4rem 2rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
          <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Your cart is empty</h2>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">Start shopping to add items to your cart</p>
          <a href="/products" class="btn">Browse Products</a>
        </div>
      </div>
      
      <div id="checkout-section" style="display: none;">
        <div style="background: var(--surface); border-radius: 12px; padding: 2rem; margin-top: 2rem;">
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem;">Order Summary</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
            <span>Subtotal:</span>
            <span id="subtotal">$0.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
            <span>Shipping:</span>
            <span>$0.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; font-weight: 600; font-size: 1.1rem;">
            <span>Total:</span>
            <span id="total">$0.00</span>
          </div>
          <button onclick="checkout()" class="btn" style="width: 100%; padding: 1rem; font-size: 1.1rem;">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
    
    <script>
      async function loadCart() {
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const cart = await res.json();
            displayCart(cart);
          }
        } catch (error) {
          console.error('Failed to load cart:', error);
        }
      }
      
      function displayCart(cart) {
        const cartContent = document.getElementById('cart-content');
        const checkoutSection = document.getElementById('checkout-section');
        
        if (cart.length === 0) {
          cartContent.innerHTML = \`
            <div style="text-align: center; padding: 4rem 2rem;">
              <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
              <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Your cart is empty</h2>
              <p style="color: var(--text-secondary); margin-bottom: 2rem;">Start shopping to add items to your cart</p>
              <a href="/products" class="btn">Browse Products</a>
            </div>
          \`;
          checkoutSection.style.display = 'none';
          return;
        }
        
        let subtotal = 0;
        const cartItems = cart.map(item => {
          const itemTotal = item.product.price * item.quantity;
          subtotal += itemTotal;
          return \`
            <div class="card" style="display: flex; gap: 1.5rem; align-items: center; margin-bottom: 1rem;">
              <img src="\${item.product.imageUrl}" alt="\${item.product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
              <div style="flex: 1;">
                <h3 style="font-weight: 600; margin-bottom: 0.5rem;">\${item.product.name}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">\${item.product.description}</p>
                <div style="color: var(--accent); font-weight: 700; font-size: 1.1rem;">$\${item.product.price}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <button onclick="updateQuantity(\${item.productId}, \${item.quantity - 1})" style="padding: 0.5rem; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); cursor: pointer;">-</button>
                <span style="font-weight: 600; min-width: 30px; text-align: center;">\${item.quantity}</span>
                <button onclick="updateQuantity(\${item.productId}, \${item.quantity + 1})" style="padding: 0.5rem; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); cursor: pointer;">+</button>
                <button onclick="removeFromCart(\${item.productId})" style="padding: 0.5rem 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; color: var(--error); cursor: pointer;">Remove</button>
              </div>
            </div>
          \`;
        }).join('');
        
        cartContent.innerHTML = cartItems;
        document.getElementById('subtotal').textContent = '\$' + subtotal.toFixed(2);
        document.getElementById('total').textContent = '\$' + subtotal.toFixed(2);
        checkoutSection.style.display = 'block';
      }
      
      async function updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
          removeFromCart(productId);
          return;
        }
        
        try {
          const res = await fetch(\`/api/cart/\${productId}\`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity })
          });
          
          if (res.ok) {
            loadCart();
            updateCartCount();
            showToast('Cart updated');
          }
        } catch (error) {
          showToast('Failed to update cart', 'error');
        }
      }
      
      async function removeFromCart(productId) {
        try {
          const res = await fetch(\`/api/cart/\${productId}\`, {
            method: 'DELETE'
          });
          
          if (res.ok) {
            loadCart();
            updateCartCount();
            showToast('Item removed from cart');
          }
        } catch (error) {
          showToast('Failed to remove item', 'error');
        }
      }
      
      async function checkout() {
        // Simple checkout - in a real app, you'd collect shipping/payment info
        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shippingAddress: '123 Main St, City, Country',
              paymentMethod: 'credit_card'
            })
          });
          
          if (res.ok) {
            const result = await res.json();
            showToast('Order placed successfully!');
            setTimeout(() => {
              window.location.href = \`/orders#\${result.order.id}\`;
            }, 1500);
          } else {
            const error = await res.json();
            showToast(error.error || 'Checkout failed', 'error');
          }
        } catch (error) {
          showToast('Checkout failed', 'error');
        }
      }
      
      // Load cart when page loads
      document.addEventListener('DOMContentLoaded', loadCart);
    </script>
  `;
  
  return createLayout('Cart', content, user);
}

module.exports = cartView;