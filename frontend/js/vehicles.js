let allVehicles = [];

function renderVehicles(vehicles) {
  const grid = document.getElementById('vehiclesGrid');
  if (!grid) return;

  if (!vehicles || vehicles.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-icon">🚗</div>
        <h3>No vehicles found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = vehicles.map(v => `
    <div class="vehicle-card" onclick="selectVehicle(${v.id})">
      <div class="vehicle-card-image">
        <img src="${v.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250&fit=crop'}"
             alt="${v.name}"
             loading="lazy"
             onerror="this.src='https://placehold.co/400x250/1a73e8/white?text=${v.name.replace(/ /g,'+')}'">
        <span class="vehicle-card-badge">${v.type || 'Standard'}</span>
      </div>
      <div class="vehicle-card-body">
        <h3>${v.name}</h3>
        <div class="vehicle-meta">
          <span>🚗 ${v.brand}</span>
          <span>📅 ${v.year}</span>
          <span>👥 ${v.seatingCapacity || 5} seats</span>
          <span>⚙️ ${v.transmission || 'Manual'}</span>
        </div>
        <p style="color:var(--gray);font-size:0.9rem;margin-bottom:12px;">
          ${v.description ? v.description.substring(0, 100) + (v.description.length > 100 ? '...' : '') : 'Premium vehicle ready for your journey.'}
        </p>
        <div class="vehicle-card-footer">
          <div class="vehicle-price">₹${Number(v.pricePerDay).toLocaleString()} <small>/ day</small></div>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            onclick="event.stopPropagation(); selectVehicle(${v.id})"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function selectVehicle(id) {
  if (!id) return;
  window.location.href = p(`/pages/booking.html?vehicle=${encodeURIComponent(String(id))}`);
}

async function loadVehicles(filters = {}) {
  const grid = document.getElementById('vehiclesGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="spinner"></div>';

  try {
    const response = await api.getVehicles(filters);
    allVehicles = response.data || [];
    renderVehicles(allVehicles);
  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-icon">⚠️</div>
        <h3>Failed to load vehicles</h3>
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="loadVehicles()" style="margin-top:15px;">Retry</button>
      </div>
    `;
  }
}

function applyFilters() {
  const search = document.getElementById('searchInput')?.value;
  const type = document.getElementById('typeFilter')?.value;
  const maxPrice = document.getElementById('priceFilter')?.value;

  loadVehicles({
    search: search || undefined,
    type: type || undefined,
    maxPrice: maxPrice || undefined,
  });
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('typeFilter').value = '';
  document.getElementById('priceFilter').value = '';
  loadVehicles();
}

document.addEventListener('DOMContentLoaded', () => {
  loadVehicles();
});
