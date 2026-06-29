let selectedVehicle = null;

async function loadVehicleDetails(vehicleId) {
  const content = document.getElementById('bookingContent');
  if (content) content.style.display = 'block';

  try {
    const response = await api.getVehicle(vehicleId);
    selectedVehicle = response.data;
    if (!selectedVehicle) throw new Error('Vehicle not found');
    document.getElementById('pageTitle').textContent = 'Book Your Vehicle';
    document.getElementById('pageSubtitle').textContent = 'Choose your rental dates and confirm the booking.';
    renderBookingSummary();
  } catch (error) {
    document.getElementById('pageTitle').textContent = 'Vehicle not found';
    document.getElementById('pageSubtitle').textContent = 'This vehicle is unavailable or the booking link is invalid.';
    if (content) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Vehicle not found</h3>
          <p>${error.message}</p>
          <a href="${p('/pages/vehicles.html')}" class="btn btn-primary" style="margin-top:15px;display:inline-block;">Browse Vehicles</a>
        </div>
      `;
    }
  } finally {
    hideLoading();
  }
}

function renderBookingSummary() {
  if (!selectedVehicle) return;

  const summary = document.getElementById('bookingSummary');
  const content = document.getElementById('bookingContent');

  summary.innerHTML = `
    <h3>Booking Summary</h3>
    <div style="margin-bottom:15px;">
      <img src="${selectedVehicle.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=200&fit=crop'}"
           alt="${selectedVehicle.name}"
           style="width:100%;height:150px;object-fit:cover;border-radius:8px;"
           onerror="this.src='https://placehold.co/400x200/1a73e8/white?text=${selectedVehicle.name.replace(/ /g,'+')}'">
    </div>
    <h4 style="margin-bottom:4px;">${selectedVehicle.name}</h4>
    <p style="color:var(--gray);font-size:0.9rem;margin-bottom:15px;">${selectedVehicle.brand} • ${selectedVehicle.year}</p>
    ${selectedVehicle.available === false ? `<div class="status-badge cancelled" style="display:inline-block;margin-bottom:15px;">Unavailable</div>` : ''}
    <div class="summary-row">
      <span>Price per day</span>
      <span style="font-weight:600;">₹${Number(selectedVehicle.pricePerDay).toLocaleString()}</span>
    </div>
    <div class="summary-row" id="totalDaysRow" style="display:none;">
      <span>Total days</span>
      <span id="totalDays">0</span>
    </div>
    <div class="summary-row total">
      <span>Total Amount</span>
      <span id="totalAmount">₹0</span>
    </div>
  `;

  const submitButton = document.getElementById('bookingForm')?.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = selectedVehicle.available === false;
    submitButton.textContent = selectedVehicle.available === false ? 'Vehicle Unavailable' : 'Confirm Booking';
  }

  if (content) content.style.display = 'block';
}

function updatePrice() {
  const startDate = document.getElementById('startDate')?.value;
  const endDate = document.getElementById('endDate')?.value;

  if (startDate && endDate && selectedVehicle) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    document.getElementById('totalDaysRow').style.display = 'flex';
    document.getElementById('totalDays').textContent = days;
    document.getElementById('totalAmount').textContent =
      `₹${(days * Number(selectedVehicle.pricePerDay)).toLocaleString()}`;
  }
}

async function handleBookingSubmit(e) {
  e.preventDefault();
  hideAlert();

  if (!requireAuth()) return;

  if (!selectedVehicle) {
    showAlert('Please select a vehicle before booking');
    return;
  }

  if (selectedVehicle.available === false) {
    showAlert('This vehicle is currently unavailable');
    return;
  }

  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (!startDate || !endDate) {
    showAlert('Please select both start and end dates');
    return;
  }

  if (new Date(startDate) < new Date().setHours(0, 0, 0, 0)) {
    showAlert('Start date must be today or later');
    return;
  }

  if (new Date(endDate) <= new Date(startDate)) {
    showAlert('End date must be after start date');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';

  try {
    const response = await api.createBooking({
      vehicleId: selectedVehicle.id,
      startDate,
      endDate,
    });

    if (response.success) {
      showAlert('Booking created successfully! You can view it in your bookings.', 'success');
      e.target.reset();
      updatePrice();
      setTimeout(() => {
        window.location.href = p('/pages/booking.html') + '?list=true';
      }, 2000);
    } else {
      showAlert(response.message || 'Booking failed');
    }
  } catch (error) {
    showAlert(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm Booking';
  }
}

async function loadMyBookings() {
  const container = document.getElementById('myBookings');
  if (!container) return;

  try {
    const response = await api.getMyBookings();
    const bookings = response.data || [];

    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No bookings yet</h3>
          <p>Start by booking a vehicle!</p>
          <a href="${p('/pages/vehicles.html')}" class="btn btn-primary" style="margin-top:15px;display:inline-block;">Browse Vehicles</a>
        </div>
      `;
      return;
    }

    container.innerHTML = '<div class="bookings-list">' +
      bookings.map(b => {
        const statusClass = b.status?.toLowerCase() || 'pending';
        return `
          <div class="booking-item">
            <div class="booking-info">
              <h4>${b.vehicle?.name || 'Vehicle'}</h4>
              <p>${b.vehicle?.brand || ''} • ${b.startDate} to ${b.endDate}</p>
              <p style="margin-top:4px;font-weight:600;color:var(--primary);">
                ₹${Number(b.totalPrice).toLocaleString()}
              </p>
            </div>
            <div style="text-align:right;">
              <span class="status-badge ${statusClass}">${b.status}</span>
              ${b.status === 'PENDING' || b.status === 'CONFIRMED' ? `
                <br><button class="btn btn-sm btn-danger" style="margin-top:8px;"
                  onclick="cancelBooking(${b.id})">Cancel</button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('') +
      '</div>';
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Failed to load bookings</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

async function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;

  try {
    const response = await api.cancelBooking(id);
    if (response.success) {
      loadMyBookings();
    } else {
      alert(response.message || 'Failed to cancel booking');
    }
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  const params = new URLSearchParams(window.location.search);
  let vehicleId = params.get('vehicle');

  if (!vehicleId) {
    vehicleId = sessionStorage.getItem('selectedVehicleId');
  }

  const showList = params.get('list');

  if (showList) {
    document.getElementById('pageTitle').textContent = 'My Bookings';
    document.getElementById('pageSubtitle').textContent = 'View, manage, or cancel your bookings.';
    document.getElementById('bookingForm')?.remove();
    document.getElementById('bookingSummary')?.remove();
    loadMyBookings();
    return;
  }

  sessionStorage.removeItem('selectedVehicleId');

  const content = document.getElementById('bookingContent');
  if (content) content.style.display = 'block';

  if (vehicleId) {
    if (content) content.innerHTML = '<div class="spinner"></div>';
    loadVehicleDetails(vehicleId);
  } else {
    document.getElementById('pageTitle').textContent = 'Choose a Vehicle';
    document.getElementById('pageSubtitle').textContent = 'Select a vehicle first, then complete the booking form with your dates.';
    document.getElementById('bookingContent').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🚗</div>
        <h3>No vehicle selected</h3>
        <p>Please choose a vehicle from the available fleet to open the booking form.</p>
        <a href="${p('/pages/vehicles.html')}" class="btn btn-primary" style="margin-top:15px;display:inline-block;">Choose a Vehicle</a>
      </div>
    `;
  }

  document.getElementById('startDate')?.addEventListener('change', updatePrice);
  document.getElementById('endDate')?.addEventListener('change', updatePrice);
  document.getElementById('bookingForm')?.addEventListener('submit', handleBookingSubmit);
});
