const { createLayout } = require('./layout');
const { escapeHtml } = require('../utils/helpers');

function ordersView(orders) {
  const content = orders.length === 0 ? `
    <div style="text-align: center; padding: 4rem 2rem;">
      <h1>No Orders Yet</h1>
      <p style="color: var(--text-muted); font-size: 1.2rem; margin: 1rem 0 2rem;">
        Start shopping to see your orders here!
      </p>
      <a href="/products" class="btn">Start Shopping</a>
    </div>
  ` : `
    <h1>Your Orders</h1>
    <p style="color: var(--text-muted); margin-bottom: 2rem;">${orders.length} orders</p>

    <div style="display: grid; gap: 1.5rem;">
      ${orders.map(order => `
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
            <div>
              <div style="font-size: 1.2rem; font-weight: 700;">Order #${order.id}</div>
              <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
                ${new Date(order.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div style="background: var(--accent); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; text-transform: uppercase; font-size: 0.85rem;">
              ${order.status}
            </div>
          </div>

          <div style="margin-bottom: 1rem;">
            ${order.items.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                <div>${escapeHtml(item.name)} × ${item.quantity}</div>
                <div style="color: var(--accent); font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>

          <div style="text-align: right; padding-top: 1rem; border-top: 1px solid var(--border);">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent);">
              Total: $${order.total.toFixed(2)}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return createLayout('Your Orders - TechStore', content);
}

module.exports = { ordersView };
