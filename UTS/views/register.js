const { createLayout } = require('./layout');

function registerView({ error, user }) {
  const content = `
    <div style="max-width: 400px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 3rem;">
        <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; background: linear-gradient(45deg, var(--accent), #ff6b9d); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Join TechStore
        </h1>
        <p style="color: var(--text-secondary);">Create your account and start shopping</p>
      </div>

      ${error ? `
        <div style="
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--error);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          font-weight: 500;
        ">
          ${error}
        </div>
      ` : ''}

      <form method="POST" action="/auth/register" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">
            Full Name
          </label>
          <input 
            type="text" 
            name="name" 
            required
            style="
              width: 100%;
              padding: 1rem;
              background: var(--surface);
              border: 1px solid var(--border);
              border-radius: 8px;
              color: var(--text-primary);
              font-size: 1rem;
              transition: all 0.3s ease;
            "
            placeholder="Enter your full name"
            onfocus="this.style.borderColor='var(--accent)'; this.style.boxShadow='0 0 0 3px var(--accent-glow)';"
            onblur="this.style.borderColor='var(--border)'; this.style.boxShadow='none';"
          >
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">
            Email Address
          </label>
          <input 
            type="email" 
            name="email" 
            required
            style="
              width: 100%;
              padding: 1rem;
              background: var(--surface);
              border: 1px solid var(--border);
              border-radius: 8px;
              color: var(--text-primary);
              font-size: 1rem;
              transition: all 0.3s ease;
            "
            placeholder="Enter your email"
            onfocus="this.style.borderColor='var(--accent)'; this.style.boxShadow='0 0 0 3px var(--accent-glow)';"
            onblur="this.style.borderColor='var(--border)'; this.style.boxShadow='none';"
          >
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">
            Password
          </label>
          <input 
            type="password" 
            name="password" 
            required
            style="
              width: 100%;
              padding: 1rem;
              background: var(--surface);
              border: 1px solid var(--border);
              border-radius: 8px;
              color: var(--text-primary);
              font-size: 1rem;
              transition: all 0.3s ease;
            "
            placeholder="Create a password (min. 6 characters)"
            onfocus="this.style.borderColor='var(--accent)'; this.style.boxShadow='0 0 0 3px var(--accent-glow)';"
            onblur="this.style.borderColor='var(--border)'; this.style.boxShadow='none';"
          >
        </div>

        <div>
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">
            Confirm Password
          </label>
          <input 
            type="password" 
            name="confirmPassword" 
            required
            style="
              width: 100%;
              padding: 1rem;
              background: var(--surface);
              border: 1px solid var(--border);
              border-radius: 8px;
              color: var(--text-primary);
              font-size: 1rem;
              transition: all 0.3s ease;
            "
            placeholder="Confirm your password"
            onfocus="this.style.borderColor='var(--accent)'; this.style.boxShadow='0 0 0 3px var(--accent-glow)';"
            onblur="this.style.borderColor='var(--border)'; this.style.boxShadow='none';"
          >
        </div>

        <button 
          type="submit"
          class="btn"
          style="width: 100%; padding: 1rem; font-size: 1rem; margin-top: 1rem;"
        >
          Create Account
        </button>
      </form>

      <div style="text-align: center; margin-top: 2.5rem; padding-top: 2.5rem; border-top: 1px solid var(--border);">
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">
          Already have an account?
        </p>
        <a 
          href="/auth/login" 
          class="btn-secondary"
          style="display: inline-block; padding: 0.875rem 2rem; text-decoration: none;"
        >
          Sign In
        </a>
      </div>
    </div>
  `;

  return createLayout('Register', content, user);
}

module.exports = registerView;