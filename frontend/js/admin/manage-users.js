async function loadUsers() {
  if (!requireAdmin()) return;

  const tbody = document.querySelector('#usersTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;"><div class="spinner" style="margin:20px auto;"></div></td></tr>';

  try {
    const users = await api.getAdminUsers();

    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--gray);">No users found.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td>${u.phone || '-'}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="status-badge ${u.role === 'ADMIN' ? 'confirmed' : 'pending'}">${u.role}</span>
            ${u.role !== 'ADMIN' ? `
              <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Delete</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--danger);">Error: ${error.message}</td></tr>`;
  }
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user? All their bookings will also be removed.')) return;

  try {
    const response = await api.deleteUser(id);
    if (response.success) {
      loadUsers();
    } else {
      alert(response.message || 'Failed to delete user');
    }
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener('DOMContentLoaded', loadUsers);
