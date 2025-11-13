const { createLayout } = require('./layout');

function profileView({ user, error, success }) {
  const content = `
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="margin-bottom: 3rem;">
        <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; background: linear-gradient(45deg, var(--accent), #ff6b9d); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Your Profile
        </h1>
        <p style="color: var(--text-secondary);">Manage your account information</p>
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

      ${success ? `
        <div style="
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: var(--success);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          font-weight: 500;
        ">
          ${success}
        </div>
      ` : ''}

      <div class="card">
        <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem;">
          <div style="
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, var(--accent), #ff6b9d);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: 700;
            color: white;
            box-shadow: 0 8px 32px rgba(255, 45, 85, 0.3);
          ">
            ${user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem;">${user.name}</h2>
            <p style="color: var(--text-secondary); margin-bottom: 0.25rem;">${user.email}</p>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Member since ${new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div style="border-top: 1px solid var(--border); padding-top: 2rem;">
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem;">Account Details</h3>
          
          <div style="display: grid; gap: 1.5rem;">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; align-items: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <span style="font-weight: 600; color: var(--text-secondary);">Name:</span>
              <span style="color: var(--text-primary);">${user.name}</span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; align-items: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <span style="font-weight: 600; color: var(--text-secondary);">Email:</span>
              <span style="color: var(--text-primary);">${user.email}</span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; align-items: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <span style="font-weight: 600; color: var(--text-secondary);">Member Since:</span>
              <span style="color: var(--text-primary);">${new Date(user.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; align-items: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <span style="font-weight: 600; color: var(--text-secondary);">User ID:</span>
              <span style="color: var(--text-primary); font-family: monospace; font-size: 0.9rem;">${user.id}</span>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid var(--border); padding-top: 2rem; margin-top: 2rem;">
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a 
              href="/orders" 
              class="btn"
              style="text-decoration: none;"
            >
              View Orders
            </a>
            
            <a 
              href="/auth/logout" 
              class="btn-secondary"
              style="text-decoration: none;"
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  return createLayout('Profile', content, user);
}

module.exports = profileView;