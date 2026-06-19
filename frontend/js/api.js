const API_BASE = window.__API_BASE__ || (
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://localhost:8081/api'
    : 'https://car-rental-production-ad72.up.railway.app/api'
);

function stripOrigin(url) {
  try {
    return new URL(url).pathname.replace(/\/js\/api\.js$/, '');
  } catch {
    return '';
  }
}

let BASE_PATH = window.__BASE_PATH__ ?? '';
if (!BASE_PATH) {
  const scripts = document.getElementsByTagName('script');
  for (const s of scripts) {
    const src = s.src || '';
    if (src.includes('/js/api.js')) {
      BASE_PATH = stripOrigin(src);
      break;
    }
  }
}

function p(path) {
  return BASE_PATH + path;
}

function fixLinks() {
  const base = BASE_PATH;
  if (!base) return;
  document.querySelectorAll('a[href^="/"]').forEach(a => {
    const href = a.getAttribute('href');
    if (href.startsWith('/') && !href.startsWith(base)) {
      a.setAttribute('href', base + href);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixLinks);
} else {
  fixLinks();
}

const api = {
  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'ADMIN';
  },

  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = this.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  },

  del(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // Auth
  login(email, password) {
    return this.post('/auth/login', { email, password });
  },

  register(name, email, password, phone) {
    return this.post('/auth/register', { name, email, password, phone });
  },

  // Vehicles
  getVehicles(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.type) query.set('type', params.type);
    if (params.maxPrice) query.set('maxPrice', params.maxPrice);
    const qs = query.toString();
    return this.get(`/vehicles${qs ? `?${qs}` : ''}`);
  },

  getVehicle(id) {
    return this.get(`/vehicles/${id}`);
  },

  // Bookings
  createBooking(data) {
    return this.post('/bookings', data);
  },

  getMyBookings() {
    return this.get('/bookings/my');
  },

  getBooking(id) {
    return this.get(`/bookings/${id}`);
  },

  cancelBooking(id) {
    return this.put(`/bookings/${id}/cancel`);
  },

  // Admin
  getDashboard() {
    return this.get('/admin/dashboard');
  },

  getAdminVehicles() {
    return this.get('/admin/vehicles');
  },

  createVehicle(vehicle) {
    return this.post('/admin/vehicles', vehicle);
  },

  updateVehicle(id, vehicle) {
    return this.put(`/admin/vehicles/${id}`, vehicle);
  },

  deleteVehicle(id) {
    return this.del(`/admin/vehicles/${id}`);
  },

  getAdminBookings() {
    return this.get('/admin/bookings');
  },

  updateBookingStatus(id, status) {
    return this.put(`/admin/bookings/${id}/status?status=${status}`);
  },

  getAdminUsers() {
    return this.get('/admin/users');
  },

  deleteUser(id) {
    return this.del(`/admin/users/${id}`);
  },
};
