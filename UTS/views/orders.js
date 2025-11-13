const { createLayout } = require('./layout');

function ordersView({ orders, user }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'var(--warning)';
      case 'shipped': return 'var(--accent)';
      case 'delivered': return 'var(--success)';
      case 'cancelled': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing': return '🔄';
      case 'shipped': return '🚚';
      case 'delivered': return '✅';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  const content = `
    <div style="max-width: 1000px; margin: 0 auto;">
      <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 2rem; background: linear-gradient(45deg, var(--accent), #ff6b9d); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        Order History
      </h1>
      
      ${orders.length === 0 ? `
        <div class="card" style="text-align: center; padding: 4rem 2rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">📦</div>
          <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">No orders yet</h2>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">Start shopping to see your orders here</p>
          <a href="/products" class="btn">Browse Products</a>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          ${orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(order => `
            <div class="card">
              <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1.5rem; gap: 2rem;">
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="font-size: 1.25rem; font-weight: 700;">Order #${order.id}</h3>
                    <span style="
                      display: inline-flex;
                      align-items: center;
                      gap: 0.5rem;
                      padding: 0.5rem 1rem;
                      background: ${getStatusColor(order.status)}20;
                      color: ${getStatusColor(order.status)};
                      border: 1px solid ${getStatusColor(order.status)}40;
                      border-radius: 20px;
                      font-size: 0.8rem;
                      font-weight: 600;
                    ">
                      ${getStatusIcon(order.status)} ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                    <div>
                      <div style="font-size: 0.9rem; color: var(--text-secondary);">Order Date</div>
                      <div style="font-weight: 600;">${new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div style="font-size: 0.9rem; color: var(--text-secondary);">Total Amount</div>
                      <div style="font-weight: 600; color: var(--accent);">$${order.total.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style="font-size: 0.9rem; color: var(--text-secondary);">Items</div>
                      <div style="font-weight: 600;">${order.items.reduce((sum, item) => sum + item.quantity, 0)} items</div>
                    </div>
                    ${order.estimatedDelivery ? `
                      <div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">Est. Delivery</div>
                        <div style="font-weight: 600;">${new Date(order.estimatedDelivery).toLocaleDateString()}</div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
              
              <div style="border-top: 1px solid var(--border); padding-top: 1.5rem;">
                <h4 style="font-weight: 600; margin-bottom: 1rem;">Order Items</h4>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                  ${order.items.map(item => `
                    <div style="display: flex; gap: 1rem; align-items: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                      <img src="${item.imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;">
                      <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">${item.name}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Quantity: ${item.quantity}</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-weight: 600; color: var(--accent);">$${item.price}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Total: $${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              ${order.shippingAddress ? `
                <div style="border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 1.5rem;">
                  <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Shipping Address</h4>
                  <p style="color: var(--text-secondary);">${order.shippingAddress}</p>
                </div>
              ` : ''}
              
              <div style="border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 0.9rem; color: var(--text-secondary);">Payment Method</div>
                  <div style="font-weight: 600; text-transform: capitalize;">${order.paymentMethod}</div>
                </div>
                
                ${order.status === 'processing' ? `
                  <button 
                    onclick="cancelOrder(${order.id})" 
                    style="
                      padding: 0.5rem 1rem;
                      background: rgba(239, 68, 68, 0.1);
                      border: 1px solid rgba(239, 68, 68, 0.3);
                      color: var(--error);
                      border-radius: 6px;
                      cursor: pointer;
                      font-weight: 500;
                    "
                  >
                    Cancel Order
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
    
    <script>
      async function cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order?')) {
          return;
        }
        
        try {
          // Note: In a real application, you'd have a proper cancel order endpoint
          showToast('Order cancellation feature coming soon!', 'error');
        } catch (error) {
          showToast('Failed to cancel order', 'error');
        }
      }
      
      // Highlight order if URL hash matches
      document.addEventListener('DOMContentLoaded', () => {
        const orderId = window.location.hash.substring(1);
        if (orderId) {
          const orderElement = document.querySelector(\`[data-order-id="\${orderId}"]\`);
          if (orderElement) {
            orderElement.scrollIntoView({ behavior: 'smooth' });
            orderElement.style.animation = 'pulse 2s ease-in-out';
          }
        }
      });
    </script>
    
    <style>
      @keyframes pulse {
        0%, 100% { background: var(--surface); }
        50% { background: var(--accent-glow); }
      }
    </style>
  `;
  
  return createLayout('Orders', content, user);
}

module.exports = ordersView;