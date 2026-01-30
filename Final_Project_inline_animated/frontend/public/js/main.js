// API Base URL - automatically detects the current host
const API_URL = `${window.location.origin}/api`;

// Get auth token from localStorage
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// Get user from localStorage
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('user');

// API Request Helper
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Show alert message
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(alertDiv, container.firstChild);
    setTimeout(() => alertDiv.remove(), 5000);
  }
}

// Show loading spinner
function showLoading(container) {
  container.innerHTML = '<div class="spinner"></div>';
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Update navigation based on auth status
function updateNavigation() {
  const user = getUser();
  const navLinks = document.querySelector('.nav-links');
  
  if (!navLinks) return;

  if (user) {
    navLinks.innerHTML = `
      <li><a href="/">Home</a></li>
      <li><a href="/blog-list">Blog</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
      ${user.role !== 'READER' ? '<li><a href="/admin-dashboard">Dashboard</a></li>' : ''}
      <li><span style="color: var(--gray);">Welcome, ${user.firstName}</span></li>
      <li><a href="#" id="logoutBtn" class="btn btn-secondary btn-sm">Logout</a></li>
    `;

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    navLinks.innerHTML = `
      <li><a href="/">Home</a></li>
      <li><a href="/blog-list">Blog</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
      <li><a href="/login" class="btn btn-primary btn-sm">Login</a></li>
    `;
  }
}

// Logout function
function logout() {
  removeToken();
  removeUser();
  window.location.href = '/';
}

// Check authentication for protected pages
function requireAuth(requiredRoles = []) {
  const user = getUser();
  
  if (!user) {
    window.location.href = '/login';
    return false;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    showAlert('You do not have permission to access this page', 'error');
    window.location.href = '/';
    return false;
  }

  return true;
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', () => {
  updateNavigation();
  console.log('DevInsights initialized. API URL:', API_URL);
});

// Export functions for use in other scripts
window.DevInsights = {
  apiRequest,
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  showAlert,
  showLoading,
  formatDate,
  updateNavigation,
  logout,
  requireAuth,
  API_URL
};