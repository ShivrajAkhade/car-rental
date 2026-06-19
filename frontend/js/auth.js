function updateNavbar() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const isAuth = api.isAuthenticated();
  const user = api.getUser();
  const isAdmin = api.isAdmin();

  let html = `
    <a href="${p('/')}" class="${window.location.pathname === p('/') ? 'active' : ''}">Home</a>
    <a href="${p('/pages/vehicles.html')}" class="${window.location.pathname.includes('vehicles') ? 'active' : ''}">Vehicles</a>
  `;

  if (isAuth) {
    html += `<a href="${p('/pages/booking.html?list=true')}">My Bookings</a>`;
    if (isAdmin) {
      html += `<a href="${p('/pages/admin/dashboard.html')}">Admin</a>`;
    }
    html += `
      <span style="color: var(--gray); font-size: 0.9rem; padding: 0 8px;">
        Hi, ${user.name.split(' ')[0]}
      </span>
      <button onclick="handleLogout()" class="btn btn-sm btn-outline" style="padding: 6px 18px;">
        Logout
      </button>
    `;
  } else {
    html += `
      <a href="${p('/pages/login.html')}" class="btn-login">Login</a>
      <a href="${p('/pages/register.html')}" class="btn-register">Register</a>
    `;
  }

  navLinks.innerHTML = html;
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = p('/');
}

function requireAuth() {
  if (!api.isAuthenticated()) {
    const redirect = `${window.location.pathname}${window.location.search}`;
    window.location.href = p('/pages/login.html?redirect=') + encodeURIComponent(redirect);
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!requireAuth()) return false;
  if (!api.isAdmin()) {
    window.location.href = '/';
    return false;
  }
  return true;
}

function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.add('active');
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.remove('active');
}

function showAlert(message, type = 'error') {
  const alert = document.getElementById('alert');
  if (!alert) return;
  alert.textContent = message;
  alert.className = `alert alert-${type}`;
  alert.style.display = 'block';
}

function hideAlert() {
  const alert = document.getElementById('alert');
  if (alert) {
    alert.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();

  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar')) {
        navLinks.classList.remove('open');
      }
    });
  }
});
