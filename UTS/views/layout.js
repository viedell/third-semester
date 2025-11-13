const commonStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    
    :root {
      --bg-primary: #0a0a0a;
      --bg-secondary: #111111;
      --surface: #1a1a1a;
      --surface-elevated: #222222;
      --border: rgba(255, 255, 255, 0.1);
      --border-hover: rgba(255, 45, 85, 0.4);
      --text-primary: #ffffff;
      --text-secondary: #a0a0a0;
      --text-muted: #666666;
      --accent: #ff2d55;
      --accent-glow: rgba(255, 45, 85, 0.15);
      --accent-hover: #ff1744;
      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.6);
      --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.7);
      --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.8);
      --shadow-glow: 0 0 40px rgba(255, 45, 85, 0.2);
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      display: flex;
      flex-direction: column;
    }
    
    .bg-pattern {
      position: fixed;
      inset: 0;
      background: 
        radial-gradient(circle at 20% 80%, rgba(255, 45, 85, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 45, 85, 0.05) 0%, transparent 50%),
        linear-gradient(45deg, rgba(10, 10, 10, 0.9) 0%, rgba(26, 26, 26, 0.9) 100%);
      pointer-events: none;
      z-index: 0;
    }
    
    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid var(--border);
    }
    
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--text-primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      letter-spacing: -0.5px;
    }
    
    .logo::before {
      content: '⚡';
      font-size: 1.25rem;
      background: linear-gradient(45deg, var(--accent), #ff6b9d);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 20px var(--accent));
    }
    
    .nav-links {
      display: flex;
      gap: 2rem;
      align-items: center;
    }
    
    .nav-links a {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .nav-links a:hover {
      color: var(--text-primary);
    }
    
    .nav-links a.active {
      color: var(--accent);
    }
    
    .user-menu {
      position: relative;
    }
    
    .user-menu-btn {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .user-menu-btn:hover {
      border-color: var(--accent);
      box-shadow: 0 0 20px var(--accent-glow);
    }
    
    .user-menu-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.5rem;
      min-width: 160px;
      display: none;
      box-shadow: var(--shadow-lg);
    }
    
    .user-menu:hover .user-menu-dropdown {
      display: block;
    }
    
    .user-menu-dropdown a {
      display: block;
      padding: 0.75rem 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 6px;
      transition: all 0.2s;
      font-size: 0.9rem;
    }
    
    .user-menu-dropdown a:hover {
      background: var(--surface);
      color: var(--text-primary);
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      position: relative;
      z-index: 1;
      flex: 1;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: var(--accent);
      color: white;
      text-decoration: none;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 14px rgba(255, 45, 85, 0.3);
    }
    
    .btn:hover {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 45, 85, 0.4);
    }
    
    .btn-secondary {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-primary);
    }
    
    .btn-secondary:hover {
      background: var(--surface);
      border-color: var(--accent);
    }
    
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }
    
    .card:hover {
      border-color: var(--accent);
      box-shadow: var(--shadow-glow);
      transform: translateY(-4px);
    }
    
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }
    
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
    
    .toast.success::before {
      content: '✓';
      color: var(--success);
    }
    
    .toast.error::before {
      content: '!';
      color: var(--error);
    }
    
    @media (max-width: 768px) {
      .nav-container {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }
      
      .nav-links {
        gap: 1rem;
      }
      
      .container {
        padding: 1rem;
      }
    }
  </style>
`;

const commonScripts = `
  <script>
    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = 'toast ' + type;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => toast.classList.add('show'), 100);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
    
    async function addToCart(productId, quantity = 1) {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity })
        });
        
        if (res.status === 401) {
          showToast('Please login to add items to cart', 'error');
          setTimeout(() => {
            window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
          }, 1500);
          return;
        }
        
        if (res.ok) {
          showToast('Added to cart!');
          updateCartCount();
        } else {
          const err = await res.json();
          showToast(err.error || 'Error adding to cart', 'error');
        }
      } catch (e) {
        showToast('Network error', 'error');
      }
    }
    
    async function updateCartCount() {
      try {
        const res = await fetch('/api/cart');
        if (res.ok) {
          const cart = await res.json();
          const count = cart.reduce((sum, item) => sum + item.quantity, 0);
          const badge = document.getElementById('cart-badge');
          if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
          }
        }
      } catch (e) {}
    }
    
    document.addEventListener('DOMContentLoaded', updateCartCount);
  </script>
`;

function createLayout(title, content, user = null) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - TechStore</title>
      ${commonStyles}
    </head>
    <body>
      <div class="bg-pattern"></div>
      
      <nav>
        <div class="nav-container">
          <a href="/" class="logo">TECHSTORE</a>
          <div class="nav-links">
            <a href="/" class="active">Home</a>
            <a href="/products">Products</a>
            ${user ? `
              <a href="/cart">Cart 
                <span id="cart-badge" style="
                  background: var(--accent);
                  color: white;
                  border-radius: 50%;
                  width: 20px;
                  height: 20px;
                  display: none;
                  align-items: center;
                  justify-content: center;
                  font-size: 0.7rem;
                  font-weight: 600;
                  margin-left: 0.25rem;
                "></span>
              </a>
              <a href="/orders">Orders</a>
              <div class="user-menu">
                <div class="user-menu-btn">
                  ${user.name.split(' ')[0]} ▾
                </div>
                <div class="user-menu-dropdown">
                  <a href="/profile">Profile</a>
                  <a href="/orders">Orders</a>
                  <a href="/auth/logout">Logout</a>
                </div>
              </div>
            ` : `
              <a href="/auth/login">Login</a>
              <a href="/auth/register" class="btn">Sign Up</a>
            `}
          </div>
        </div>
      </nav>
      
      <div class="container">
        ${content}
      </div>
      
      ${commonScripts}
    </body>
    </html>
  `;
}

module.exports = { createLayout };