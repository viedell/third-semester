// =====================
// LOGIN FORM HANDLER
// =====================
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    const response = await DevInsights.apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true
    });

    const { token, user } = response.data;

    DevInsights.setToken(token);
    DevInsights.setUser(user);
    DevInsights.showAlert('Login successful!', 'success');

    setTimeout(() => {
      if (user.role === 'Admin' || user.role === 'Writer') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 1000);

  } catch (error) {
    DevInsights.showAlert(error.message || 'Login failed', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
});


// =====================
// REGISTER FORM HANDLER
// =====================
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName')?.value;
  const lastName = document.getElementById('lastName')?.value;
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (password !== confirmPassword) {
    DevInsights.showAlert('Passwords do not match', 'error');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    const response = await DevInsights.apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password
      }),
      skipAuth: true
    });

    const { token, user } = response.data;

    DevInsights.setToken(token);
    DevInsights.setUser(user);
    DevInsights.showAlert('Registration successful!', 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (error) {
    DevInsights.showAlert(error.message || 'Registration failed', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
});
