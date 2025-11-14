const bcrypt = require('bcryptjs');

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

module.exports = {
  escapeHtml,
  hashPassword,
  comparePassword,
  validateEmail,
  validatePassword
};


// ============================================
// FILE 5: views/login.js (NEW)
// ============================================
const { createLayout } = require('./layout');

function loginView(error = null, redirect = '/') {
  const content = `
    <div style="max-width: 450px; margin: 4rem auto;">
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 3rem; box-shadow: var(--shadow-lg);">
        <h1 style="font-size: 2rem; margin-bottom: 0.5rem; text-align: center;">Welcome Back</h1>
        <p style="color: var(--text-secondary); text-align: center; margin-bottom: 2rem;">
          Sign in to your account
        </p>

        ${error ? `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; color: #f87171;">
            ${error}
          </div>
        ` : ''}

        <form method="POST" action="/auth/login">
          <input type="hidden" name="redirect" value="${redirect}">
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-weight: 500;">
              Email Address
            </label>
            <input 
              type="email" 
              name="email" 
              required 
              style="width: 100%; padding: 0.875rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 1rem;"
              placeholder="you@example.com"
            >
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-weight: 500;">
              Password
            </label>
            <input 
              type="password" 
              name="password" 
              required 
              style="width: 100%; padding: 0.875rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 1rem;"
              placeholder="••••••••"
            >
          </div>

          <button type="submit" class="btn" style="width: 100%; margin-bottom: 1rem;">
            Sign In
          </button>
        </form>

        <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
          <p style="color: var(--text-secondary);">
            Don't have an account? 
            <a href="/auth/register" style="color: var(--accent); text-decoration: none; font-weight: 600;">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `;

  return createLayout('Login - TechStore', content);
}

module.exports = { loginView };