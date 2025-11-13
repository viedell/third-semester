const { createLayout } = require('./layout');

function registerView({ error, user }) {
  const content = `
    <div style="max-width: 400px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 3rem;">
        <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -1px;">Create Account</h1>
        <p style="color: var(--text-secondary); font-size: 1.1rem;">Join TechStore and start shopping today</p>
      </div>

      ${error ? `
        <div style="
          background: rgba(255, 45, 85, 0.1);
          border: 1px solid rgba(255, 45, 85, 0.3);
          color: var(--accent);
          padding: 1rem 1.25rem;
          border-radius: 10px;
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
              padding: 1rem 1.25rem;
              background: var(--surface-elevated);
              border: 1px solid var(--border);
              border-radius: 10px;
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
              padding: 1rem 1.25rem;
              background: var(--surface-elevated);
              border: 1px solid var(--border);
              border-radius: 10px;
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
              padding: 1rem 1.25rem;
              background: var(--surface-elevated);
              border: 1px solid var(--border);
              border-radius: 10px;
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
              padding: 1rem 1.25rem;
              background: var(--surface-elevated);
              border: 1px solid var(--border);
              border-radius: 10px;
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
          style="
            width: 100%;
            padding: 1rem 1.25rem;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1rem;
          "
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255, 45, 85, 0.4)';"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 14px rgba(255, 45, 85, 0.3)';"
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
          style="
            display: inline-block;
            padding: 0.875rem 2rem;
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text-primary);
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            transition: all 0.3s ease;
          "
          onmouseover="this.style.background='var(--surface)'; this.style.borderColor='var(--border-hover)';"
          onmouseout="this.style.background='transparent'; this.style.borderColor='var(--border)';"
        >
          Sign In
        </a>
      </div>
    </div>
  `;

  return createLayout('Register - TechStore', content, user);
}

module.exports = registerView;