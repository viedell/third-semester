// Protect admin pages
if (location.pathname.includes('admin-dashboard.html')) {
  DevInsights.requireAuth(['ADMIN', 'WRITER']);
}

// Load dashboard stats
async function loadDashboardStats() {
  const res = await DevInsights.apiRequest('/posts/my-posts?limit=100');
  const posts = res?.data?.posts || [];

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'PUBLISHED').length,
    draft: posts.filter(p => p.status === 'DRAFT').length,
    totalViews: posts.reduce((s, p) => s + (p.views || 0), 0)
  };

  document.getElementById('dashboardStats').innerHTML = `
    ${Object.entries(stats).map(([k, v]) => `
      <div class="stat-card">
        <div class="stat-number">${v}</div>
        <div class="stat-label">${k}</div>
      </div>
    `).join('')}
  `;
}

// Load user posts
async function loadMyPosts() {
  const container = document.getElementById('myPostsTable');
  if (!container) return;

  DevInsights.showLoading(container);

  const res = await DevInsights.apiRequest('/posts/my-posts');
  const posts = res?.data?.posts || [];

  if (!posts.length) {
    container.innerHTML = '<p>No posts yet.</p>';
    return;
  }

  container.innerHTML = `
    <table class="table">
      <tbody>
        ${posts.map(p => `
          <tr>
            <td>${p.title}</td>
            <td>${p.status}</td>
            <td>${p.views || 0}</td>
            <td>
              <button onclick="editPost('${p.id}')">Edit</button>
              <button onclick="deletePost('${p.id}')">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Init
if (location.pathname.includes('admin-dashboard.html')) {
  loadDashboardStats();
  loadMyPosts();
}
