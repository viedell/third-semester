// Load and display blog posts
async function loadBlogPosts(page = 1, search = '') {
  const container = document.getElementById('blogGrid');
  const paginationContainer = document.getElementById('pagination');
  
  if (!container) return;

  DevInsights.showLoading(container);

  try {
    const params = new URLSearchParams({ page, limit: 9 });
    if (search) params.append('search', search);

    const data = await DevInsights.apiRequest(`/posts/published?${params}`, {
      skipAuth: true
    });

    const { posts, pagination } = data.data;

    if (posts.length === 0) {
      container.innerHTML = '<p class="text-center">No posts found.</p>';
      return;
    }

    container.innerHTML = posts.map(post => `
      <div class="card">
        ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}" class="card-img">` : ''}
        <div class="card-body">
          <h2 class="card-title">
            <a href="blog-detail.html?slug=${post.slug}">${post.title}</a>
          </h2>
          <div class="card-meta">
            <div class="author-info">
              ${post.author.avatar ? `<img src="${post.author.avatar}" alt="${post.author.firstName}" class="author-avatar">` : ''}
              <span>${post.author.firstName} ${post.author.lastName}</span>
            </div>
            <span>•</span>
            <span>${DevInsights.formatDate(post.publishedAt)}</span>
            <span>•</span>
            <span>${post.readTime} min read</span>
          </div>
          <p class="card-excerpt">${post.excerpt}</p>
          <div class="tags">
            ${post.tags.map(tag => `<a href="blog-list.html?tag=${tag}" class="tag">${tag}</a>`).join('')}
          </div>
        </div>
      </div>
    `).join('');

    // Render pagination
    if (paginationContainer && pagination.totalPages > 1) {
      renderPagination(paginationContainer, pagination, search);
    }

  } catch (error) {
    container.innerHTML = `<p class="text-center alert-error">Error loading posts: ${error.message}</p>`;
  }
}

// Render pagination
function renderPagination(container, pagination, search) {
  const { page, totalPages } = pagination;
  
  let html = '<div class="pagination">';
  
  // Previous button
  html += `<button ${page === 1 ? 'disabled' : ''} onclick="loadBlogPosts(${page - 1}, '${search}')">Previous</button>`;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      html += `<button class="${i === page ? 'active' : ''}" onclick="loadBlogPosts(${i}, '${search}')">${i}</button>`;
    } else if (i === page - 2 || i === page + 2) {
      html += '<span>...</span>';
    }
  }
  
  // Next button
  html += `<button ${page === totalPages ? 'disabled' : ''} onclick="loadBlogPosts(${page + 1}, '${search}')">Next</button>`;
  
  html += '</div>';
  container.innerHTML = html;
}

// Load single blog post
async function loadBlogDetail() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  
  if (!slug) {
    window.location.href = 'blog-list.html';
    return;
  }

  const container = document.getElementById('blogDetail');
  if (!container) return;

  DevInsights.showLoading(container);

  try {
    const data = await DevInsights.apiRequest(`/posts/slug/${slug}`, {
      skipAuth: true
    });

    const post = data.data;

    document.title = `${post.title} - DevInsights`;
    
    // Set meta tags
    if (post.metaDesc) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = post.metaDesc;
    }

    container.innerHTML = `
      <article class="blog-detail">
        <div class="blog-header">
          <h1>${post.title}</h1>
          <div class="card-meta">
            <div class="author-info">
              ${post.author.avatar ? `<img src="${post.author.avatar}" alt="${post.author.firstName}" class="author-avatar">` : ''}
              <span>${post.author.firstName} ${post.author.lastName}</span>
            </div>
            <span>•</span>
            <span>${DevInsights.formatDate(post.publishedAt)}</span>
            <span>•</span>
            <span>${post.readTime} min read</span>
            <span>•</span>
            <span>${post.views} views</span>
          </div>
          <div class="tags mt-2">
            ${post.tags.map(tag => `<a href="blog-list.html?tag=${tag}" class="tag">${tag}</a>`).join('')}
          </div>
        </div>
        
        ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}" class="blog-cover">` : ''}
        
        <div class="blog-content">
          ${post.content.replace(/\n/g, '<br>')}
        </div>

        <div class="mt-4" style="padding-top: 2rem; border-top: 1px solid var(--border);">
          <h3>About the Author</h3>
          <div class="author-info mt-2">
            ${post.author.avatar ? `<img src="${post.author.avatar}" alt="${post.author.firstName}" class="author-avatar" style="width: 64px; height: 64px;">` : ''}
            <div>
              <strong>${post.author.firstName} ${post.author.lastName}</strong>
              ${post.author.bio ? `<p style="margin-top: 0.5rem; color: var(--gray);">${post.author.bio}</p>` : ''}
            </div>
          </div>
        </div>
      </article>
    `;

  } catch (error) {
    container.innerHTML = `<p class="text-center alert-error">Error loading post: ${error.message}</p>`;
  }
}

// Search functionality
document.getElementById('searchForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const search = document.getElementById('searchInput').value;
  loadBlogPosts(1, search);
});

// Check if we're on blog list or detail page and load content
if (window.location.pathname.includes('blog-list.html')) {
  const params = new URLSearchParams(window.location.search);
  const tag = params.get('tag');
  const search = tag || '';
  loadBlogPosts(1, search);
}

if (window.location.pathname.includes('blog-detail.html')) {
  loadBlogDetail();
}