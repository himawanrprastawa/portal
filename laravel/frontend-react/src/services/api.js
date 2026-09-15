// Centralized API Service for BSM Operations Portal

// Determine base API URL dynamically (supports both Vite dev server and Laravel production)
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (window.location.hostname === 'localhost' && window.location.port === '3000') {
    return 'http://localhost/bsm_portal/laravel/public/api';
  }
  // Dynamic resolution for production (works on both http://localhost/bsm_portal/laravel/public/ and custom virtual host domains)
  const basePath = window.location.pathname.replace(/\/index\.html?$/, '').replace(/\/$/, '');
  return `${basePath}/api`;
};

const API_BASE = getApiBase();

export const api = {
  // --- Authentication ---
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth.php?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/auth.php`);
    return res.json();
  },

  async createUser(userData) {
    const res = await fetch(`${API_BASE}/auth.php?action=create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async updateUserRole(id, role) {
    const res = await fetch(`${API_BASE}/auth.php?action=update_role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role })
    });
    return res.json();
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE}/auth.php?action=delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return res.json();
  },

  async changePassword(data) {
    const res = await fetch(`${API_BASE}/auth.php?action=change_password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // --- Comcase (Community Case) ---
  async getComcases() {
    const res = await fetch(`${API_BASE}/comcases.php`);
    return res.json();
  },

  async createComcase(data) {
    const res = await fetch(`${API_BASE}/comcases.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateComcase(id, data) {
    const res = await fetch(`${API_BASE}/comcases.php?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteComcase(id) {
    const res = await fetch(`${API_BASE}/comcases.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async reviewZoneComcase(id, approved, notes, reviewerName) {
    const res = await fetch(`${API_BASE}/comcases.php?action=review_zone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved, notes, reviewer_name: reviewerName })
    });
    return res.json();
  },

  async approveManagerComcase(id, approved, notes, approverName) {
    const res = await fetch(`${API_BASE}/comcases.php?action=approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved, notes, approver_name: approverName })
    });
    return res.json();
  },

  async payComcase(id, paidBy, paymentDate, paymentReceipt, notes) {
    const res = await fetch(`${API_BASE}/comcases.php?action=pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, paid_by: paidBy, payment_date: paymentDate, payment_receipt: paymentReceipt, notes })
    });
    return res.json();
  },

  // --- Zone Requests (PDF & Multi-Tier Signature) ---
  async getZoneRequests() {
    const res = await fetch(`${API_BASE}/zone_requests.php`);
    return res.json();
  },

  async createZoneRequest(data) {
    const res = await fetch(`${API_BASE}/zone_requests.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async signZoneRequest(id, signerRole, signerName, signatureData, notes, isApproved, rejectionReason) {
    const res = await fetch(`${API_BASE}/zone_requests.php?action=sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        signer_role: signerRole,
        signer_name: signerName,
        signature_data: signatureData,
        notes,
        is_approved: isApproved,
        rejection_reason: rejectionReason
      })
    });
    return res.json();
  },

  async disburseZoneRequest(id, paidBy, paymentDate, paymentNotes, paymentReceipt, amount) {
    const res = await fetch(`${API_BASE}/zone_requests.php?action=pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        paid_by: paidBy,
        payment_date: paymentDate,
        payment_notes: paymentNotes,
        payment_receipt: paymentReceipt,
        amount
      })
    });
    return res.json();
  },

  async deleteZoneRequest(id) {
    const res = await fetch(`${API_BASE}/zone_requests.php?action=delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return res.json();
  },

  // --- Expenses (Finance & User BBM) ---
  async getExpenses() {
    const res = await fetch(`${API_BASE}/expenses.php`);
    return res.json();
  },

  async createExpense(data) {
    const res = await fetch(`${API_BASE}/expenses.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async validateBbmExpense(id, validationData) {
    const res = await fetch(`${API_BASE}/expenses.php?action=validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...validationData })
    });
    return res.json();
  },

  async deleteExpense(id) {
    const res = await fetch(`${API_BASE}/expenses.php?action=delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return res.json();
  },

  // --- Vehicles (Armada) ---
  async getVehicles() {
    const res = await fetch(`${API_BASE}/vehicles.php`);
    return res.json();
  },

  async createVehicle(data) {
    const res = await fetch(`${API_BASE}/vehicles.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateVehicle(data) {
    const res = await fetch(`${API_BASE}/vehicles.php?action=update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteVehicle(id) {
    const res = await fetch(`${API_BASE}/vehicles.php?action=delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return res.json();
  },

  async getVehicleLogs(vehicleId, plateNumber) {
    const params = new URLSearchParams({ action: 'logs' });
    if (vehicleId) params.append('vehicle_id', vehicleId);
    if (plateNumber) params.append('plate_number', plateNumber);
    const res = await fetch(`${API_BASE}/vehicles.php?${params.toString()}`);
    return res.json();
  },

  async createVehicleLog(logData) {
    const res = await fetch(`${API_BASE}/vehicles.php?action=logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
    return res.json();
  },

  // --- Employees (HRD) ---
  async getEmployees() {
    const res = await fetch(`${API_BASE}/employees.php`);
    return res.json();
  },

  async createEmployee(data) {
    const res = await fetch(`${API_BASE}/employees.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateEmployee(data) {
    const res = await fetch(`${API_BASE}/employees.php?action=update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteEmployee(idOrNip) {
    const isNum = typeof idOrNip === 'number' || /^\d+$/.test(String(idOrNip));
    const payload = isNum ? { id: parseInt(idOrNip, 10) } : { nip: idOrNip, nik: idOrNip };
    const res = await fetch(`${API_BASE}/employees.php?action=delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // --- Settings & Workflow ---
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings.php`);
    return res.json();
  },

  async saveSettings(data) {
    const res = await fetch(`${API_BASE}/settings.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

export default api;

