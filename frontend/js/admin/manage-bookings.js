async function loadBookings() {
  if (!requireAdmin()) return;

  const tbody = document.querySelector('#bookingsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;"><div class="spinner" style="margin:20px auto;"></div></td></tr>';

  try {
    const bookings = await api.getAdminBookings();

    if (!bookings || bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--gray);">No bookings found.</td></tr>';
      return;
    }

    tbody.innerHTML = bookings.map(b => {
      const statusClass = (b.status || '').toLowerCase();
      return `
        <tr>
          <td>${b.id}</td>
          <td>${b.user?.name || 'N/A'}<br><small style="color:var(--gray);">${b.user?.email || ''}</small></td>
          <td>${b.vehicle?.name || 'N/A'}</td>
          <td>${b.startDate} → ${b.endDate}</td>
          <td>₹${Number(b.totalPrice).toLocaleString()}</td>
          <td><span class="status-badge ${statusClass}">${b.status}</span></td>
          <td>
            <div class="action-buttons">
              ${b.status === 'PENDING' ? `
                <button class="btn btn-sm btn-success" onclick="updateStatus(${b.id}, 'CONFIRMED')">Confirm</button>
                <button class="btn btn-sm btn-danger" onclick="updateStatus(${b.id}, 'CANCELLED')">Reject</button>
              ` : b.status === 'CONFIRMED' ? `
                <button class="btn btn-sm btn-danger" onclick="updateStatus(${b.id}, 'CANCELLED')">Cancel</button>
              ` : `<span style="color:var(--gray);font-size:0.85rem;">No actions</span>`}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--danger);">Error: ${error.message}</td></tr>`;
  }
}

async function updateStatus(id, status) {
  const action = status === 'CONFIRMED' ? 'confirm' : 'cancel';
  if (!confirm(`Are you sure you want to ${action} this booking?`)) return;

  try {
    const response = await api.updateBookingStatus(id, status);
    if (response.success) {
      loadBookings();
    } else {
      alert(response.message || 'Failed to update booking');
    }
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener('DOMContentLoaded', loadBookings);
