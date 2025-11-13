const commonStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    :root {
      --bg-primary: #000000;
      --bg-secondary: #0a0a0a;
      --surface: #111111;
      --surface-elevated: #1a1a1a;
      --border: rgba(255, 255, 255, 0.08);
      --border-hover: rgba(255, 45, 85, 0.3);
      --text-primary: #ffffff;
      --text-secondary: #a0a0a0;
      --text-muted: #666666;
      --accent: #ff2d55;
      --accent-glow: rgba(255, 45, 85, 0.2);
      --accent-hover: #ff1744;
      --success: #10b981;
      --warning: #f59e0b;
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
      --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5);
      --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.6);
      --shadow-glow: 0 0 40px rgba(255, 45, 85, 0.15);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
      background-image: 
        linear-gradient(rgba(255, 45, 85, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 45, 85, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
      z-index: 0;
      opacity: 0.5;
    }

    .bg-pattern::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(
        circle at center,
        var(--accent-glow) 0%,
        transparent 50%
      );
      animation: rotate 20s linear infinite;
      opacity: 0.3;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10, 10, 10, 0.8);
      backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid var(--border);
    }

    .nav-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.25rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      letter-spacing: -0.5px;
      transition: all 0.3s ease;
    }

    .logo:hover {
      color: var(--accent);
    }

    .logo::before {
      content: '';
      width: 10px;
      height: 10px;
      background: var(--accent);
      border-radius: 2px;
      box-shadow: 0 0 20px var(--accent), 0 0 40px var(--accent);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(0.95); }
    }

    .nav-links {
      display: flex;
      gap: 2.5rem;
      align-items: center;
    }

    .nav-links a {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      position: relative;
      letter-spacing: -0.2px;
    }

    .nav-links a:hover {
      color: var(--text-primary);
    }

    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--accent);
      transition: width 0.3s ease;
      box-shadow: 0 0 8px var(--accent);
    }

    .nav-links a:hover::after {
      width: 100%;
    }

    .user-menu {
      position: relative;
    }

    .user-menu-btn {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    .user-menu-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.5rem;
      min-width: 200px;
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
      border-radius: 8px;
      transition: all 0.2s;
    }

    .user-menu-dropdown a:hover {
      background: var(--surface);
      color: var(--text-primary);
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 3rem 2rem;
      position: relative;
      z-index: 1;
      flex: 1;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.75rem;
      background: var(--accent);
      color: white;
      text-decoration: none;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 14px rgba(255, 45, 85, 0.3);
      letter-spacing: -0.2px;
    }

    .btn:hover {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 45, 85, 0.4);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn-secondary {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }

    .btn-secondary:hover {
      background: var(--surface);
      border-color: var(--border-hover);
      box-shadow: var(--shadow-md);
    }

    /* Footer */
    footer {
      background: var(--surface);
      border-top: 1px solid var(--border);
      margin-top: auto;
      position: relative;
      z-index: 1;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 3rem 2rem 2rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 3rem;
      margin-bottom: 3rem;
    }

    .footer-section h3 {
      font-size: 1.1rem;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    .footer-section ul {
      list-style: none;
    }

    .footer-section ul li {
      margin-bottom: 0.75rem;
    }

    .footer-section a {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s;
      font-size: 0.95rem;
    }

    .footer-section a:hover {
      color: var(--accent);
    }

    .footer-bottom {
      border-top: 1px solid var(--border);
      padding-top: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .footer-bottom-links {
      display: flex;
      gap: 1.5rem;
    }

    .footer-bottom-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-bottom-links a:hover {
      color: var(--accent);
    }

    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      padding: 1.25rem 1.75rem;
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(20px);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
    }

    .toast.show {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .toast::before {
      content: '✓';
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: var(--accent);
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.85rem;
    }

    @media (max-width: 768px) {
      .nav-container {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }
      
      .nav-links {
        gap: 1.5rem;
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .container {
        padding: 2rem 1rem;
      }

      .footer-bottom {
        flex-direction: column;
        text-align: center;
      }
    }
  </style>
`;

const commonScripts = `
  <script>
    function showToast(message) {
      let toast = document.getElementById('toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    async function addToCart(productId, quantity = 1) {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity })
        });
        
        if (res.status === 401) {
          showToast('Please login to add items to cart');
          setTimeout(() => {
            window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
          }, 1500);
          return;
        }
        
        if (res.ok) {
          showToast('✓ Added to cart!');
          updateCartCount();
        } else {
          const err = await res.json();
          showToast(err.error || 'Error adding to cart');
        }
      } catch (e) {
        showToast('Network error');
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
            badge.textContent = count || '';
            badge.style.display = count ? 'inline' : 'none';
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
      <title>${title}</title>
      ${commonStyles}
    </head>
    <body>
      <div class="bg-pattern"></div>
      
      <nav>
        <div class="nav-container">
          <a href="/" class="logo">TECHSTORE</a>
          <div class="nav-links">
            <a href="/">Home</a>
            <a href="/products">Products</a>
            ${user ? `
              <a href="/cart">Cart <span id="cart-badge" style="background:var(--accent);padding:2px 8px;border-radius:12px;font-size:0.8rem;margin-left:4px;"></span></a>
              <a href="/orders">Orders</a>
              <div class="user-menu">
                <div class="user-menu-btn">
                  ${user.name} ▾
                </div>
                <div class="user-menu-dropdown">
                  <a href="/profile">Profile</a>
                  <a href="/orders">My Orders</a>
                  <a href="/auth/logout">Logout</a>
                </div>
              </div>
            ` : `
              <a href="/auth/login">Login</a>
              <a href="/auth/register" class="btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Sign Up</a>
            `}
          </div>
        </div>
      </nav>

      <div class="container">
        ${content}
      </div>

      <footer>
        <div class="footer-content">
          <div class="footer-grid">
            <div class="footer-section">
              <h3>Shop</h3>
              <ul>
                <li><a href="/products">All Products</a></li>
                <li><a href="/products?category=Electronics">Electronics</a></li>
                <li><a href="/products?category=Accessories">Accessories</a></li>
                <li><a href="/products?category=Audio">Audio</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h3>Support</h3>
              <ul>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/shipping">Shipping Info</a></li>
                <li><a href="/returns">Returns & Refunds</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h3>Company</h3>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/press">Press</a></li>
                <li><a href="/sustainability">Sustainability</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h3>Legal</h3>
              <ul>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/dmca">DMCA Policy</a></li>
                <li><a href="/cookies">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div class="footer-bottom">
            <div>© ${new Date().getFullYear()} TechStore. All rights reserved.</div>
            <div class="footer-bottom-links">
              <a href="/sitemap">Sitemap</a>
              <a href="/accessibility">Accessibility</a>
              <a href="/licenses">Licenses</a>
            </div>
          </div>
        </div>
      </footer>

      ${commonScripts}
    </body>
    </html>
  `;
}

module.exports = { createLayout };
