const { createLayout } = require('./layout');
const { escapeHtml } = require('../utils/helpers');

function profileView(user, orders = []) {
  const content = `
    <div style="max-width: 900px; margin: 2rem auto;">
      <h1 style="margin-bottom: 2rem;">My Profile</h1>

      <div style="display: grid; gap: 2rem;">
        <!-- User Info Card -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 2rem;">
          <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">Account Information</h2>
          
          <div style="display: grid; gap: 1rem;">
            <div>
              <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.25rem;">Name</div>
              <div style="font-weight: 600; font-size: 1.1rem;">${escapeHtml(user.name)}</div>
            </div>
            
            <div>
              <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.25rem;">Email</div>
              <div style="font-weight: 600; font-size: 1.1rem;">${escapeHtml(user.email)}</div>
            </div>
            
            <div>
              <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.25rem;">Member Since</div>
              <div style="font-weight: 600; font-size: 1.1rem;">${new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem;">
            <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">Total Orders</div>
            <div style="font-size: 2rem; font-weight: 800; color: var(--accent);">${orders.length}</div>
          </div>
          
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem;">
            <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">Total Spent</div>
            <div style="font-size: 2rem; font-weight: 800; color: var(--accent);">
              ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="/orders" class="btn">View My Orders</a>
          <a href="/products" class="btn btn-secondary">Continue Shopping</a>
          <a href="/auth/logout" class="btn btn-secondary">Logout</a>
        </div>
      </div>
    </div>
  `;

  return createLayout('My Profile - TechStore', content, user);
}

module.exports = { profileView };