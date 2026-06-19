async function loadDashboard() {
  if (!requireAdmin()) return;

  try {
    const stats = await api.getDashboard();

    document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
    document.getElementById('totalVehicles').textContent = stats.totalVehicles || 0;
    document.getElementById('totalBookings').textContent = stats.totalBookings || 0;
    document.getElementById('pendingBookings').textContent = stats.pendingBookings || 0;
    document.getElementById('confirmedBookings').textContent = stats.confirmedBookings || 0;
    document.getElementById('cancelledBookings').textContent = stats.cancelledBookings || 0;
  } catch (error) {
    document.querySelector('.stats-grid').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <h3>Failed to load dashboard</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
