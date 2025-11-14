const { createLayout } = require('./layout');

function registerView(error = null) {
  const content = `
    <div style="max-width: 450px; margin: 4rem auto;">
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 3rem; box-shadow: var(--shadow-lg);">
        <h1 style="font-size: 2rem; margin-bottom: 0.5rem; text-align: center;">Create Account</h1>
        <p style="color: var(--text-secondary); text-align: center; margin-bottom: 2rem;">
          Join TechStore today
        </p>

        ${error ? `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; color: #f87171;">
            ${error}
          </div>
        ` : ''}

        <form method="POST" action="/auth/register">
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-weight: 500;">
              Full Name
            </label>
            <input 
              type="text" 
              name="name" 
              required 
              style="width: 100%; padding: 0.875rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 1rem;"
              placeholder="John Doe"
            >
          </div>

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
              minlength="6"
              style="width: 100%; padding: 0.875rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 1rem;"
              placeholder="••••••••"
            >
            <small style="color: var(--text-muted); font-size: 0.85rem;">Minimum 6 characters</small>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-weight: 500;">
              Confirm Password
            </label>
            <input 
              type="password" 
              name="confirmPassword" 
              required 
              minlength="6"
              style="width: 100%; padding: 0.875rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 1rem;"
              placeholder="••••••••"
            >
          </div>

          <button type="submit" class="btn" style="width: 100%; margin-bottom: 1rem;">
            Create Account
          </button>
        </form>

        <div style="text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
          <p style="color: var(--text-secondary);">
            Already have an account? 
            <a href="/auth/login" style="color: var(--accent); text-decoration: none; font-weight: 600;">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `;

  return createLayout('Register - TechStore', content);
}

module.exports = { registerView };
