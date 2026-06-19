let editVehicleId = null;

async function loadVehicles() {
  if (!requireAdmin()) return;

  const tbody = document.querySelector('#vehiclesTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;"><div class="spinner" style="margin:20px auto;"></div></td></tr>';

  try {
    const vehicles = await api.getAdminVehicles();

    if (!vehicles || vehicles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--gray);">No vehicles found. Add your first vehicle!</td></tr>';
      return;
    }

    tbody.innerHTML = vehicles.map(v => `
      <tr>
        <td>${v.id}</td>
        <td><strong>${v.name}</strong></td>
        <td>${v.brand}</td>
        <td>${v.type || '-'}</td>
        <td>${v.year}</td>
        <td>₹${Number(v.pricePerDay).toLocaleString()}</td>
        <td>
          <span class="status-badge ${v.available ? 'confirmed' : 'cancelled'}">
            ${v.available ? 'Available' : 'Unavailable'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-warning" onclick="openEditModal(${v.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteVehicle(${v.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--danger);">Error: ${error.message}</td></tr>`;
  }
}

function openAddModal() {
  editVehicleId = null;
  document.getElementById('modalTitle').textContent = 'Add Vehicle';
  document.getElementById('vehicleForm').reset();
  document.getElementById('vehicleAvailable').checked = true;
  document.getElementById('vehicleModal').classList.add('active');
}

async function openEditModal(id) {
  editVehicleId = id;
  document.getElementById('modalTitle').textContent = 'Edit Vehicle';

  try {
    const response = await api.getVehicle(id);
    const v = response.data;
    if (!v) throw new Error('Vehicle not found');

    document.getElementById('vehicleName').value = v.name || '';
    document.getElementById('vehicleBrand').value = v.brand || '';
    document.getElementById('vehicleType').value = v.type || '';
    document.getElementById('vehicleYear').value = v.year || '';
    document.getElementById('vehiclePrice').value = v.pricePerDay || '';
    document.getElementById('vehicleSeats').value = v.seatingCapacity || 5;
    document.getElementById('vehicleTransmission').value = v.transmission || 'Manual';
    document.getElementById('vehicleImage').value = v.imageUrl || '';
    document.getElementById('vehicleDescription').value = v.description || '';
    document.getElementById('vehicleAvailable').checked = v.available !== false;

    document.getElementById('vehicleModal').classList.add('active');
  } catch (error) {
    alert('Failed to load vehicle details: ' + error.message);
  }
}

function closeModal() {
  document.getElementById('vehicleModal').classList.remove('active');
}

async function saveVehicle(e) {
  e.preventDefault();
  hideAlert();

  const vehicleData = {
    name: document.getElementById('vehicleName').value.trim(),
    brand: document.getElementById('vehicleBrand').value.trim(),
    type: document.getElementById('vehicleType').value.trim(),
    year: parseInt(document.getElementById('vehicleYear').value),
    pricePerDay: parseFloat(document.getElementById('vehiclePrice').value),
    seatingCapacity: parseInt(document.getElementById('vehicleSeats').value) || 5,
    transmission: document.getElementById('vehicleTransmission').value,
    imageUrl: document.getElementById('vehicleImage').value.trim(),
    description: document.getElementById('vehicleDescription').value.trim(),
    available: document.getElementById('vehicleAvailable').checked,
  };

  if (!vehicleData.name || !vehicleData.brand || !vehicleData.year || !vehicleData.pricePerDay) {
    showAlert('Please fill all required fields');
    return;
  }

  try {
    let response;
    if (editVehicleId) {
      response = await api.updateVehicle(editVehicleId, vehicleData);
    } else {
      response = await api.createVehicle(vehicleData);
    }

    if (response.success || response.data) {
      closeModal();
      loadVehicles();
    } else {
      showAlert(response.message || 'Failed to save vehicle');
    }
  } catch (error) {
    showAlert(error.message);
  }
}

async function deleteVehicle(id) {
  if (!confirm('Are you sure you want to delete this vehicle?')) return;

  try {
    const response = await api.deleteVehicle(id);
    if (response.success) {
      loadVehicles();
    } else {
      alert(response.message || 'Failed to delete vehicle');
    }
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadVehicles();
  document.getElementById('vehicleForm')?.addEventListener('submit', saveVehicle);

  document.getElementById('vehicleModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
});
