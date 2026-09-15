import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import ToastAlert from './components/ToastAlert';
import SignatureModal from './components/SignatureModal';
import LightboxModal from './components/LightboxModal';
import ComcaseApprovalModal from './components/ComcaseApprovalModal';
import ComcasePaymentModal from './components/ComcasePaymentModal';
import ZonePaymentModal from './components/ZonePaymentModal';
import ZoneCreateModal from './components/ZoneCreateModal';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ComcaseList from './pages/ComcaseList';
import ComcaseForm from './pages/ComcaseForm';
import ComcaseSummary from './pages/ComcaseSummary';
import ComcaseDetailModal from './pages/ComcaseDetailModal';
import ZoneRequests from './pages/ZoneRequests';
import ZoneDetailModal from './pages/ZoneDetailModal';
import ManagerInbox from './pages/ManagerInbox';
import ManagerExternalAll from './pages/ManagerExternalAll';
import FinancePending from './pages/FinancePending';
import FinanceTransactions from './pages/FinanceTransactions';
import FinanceInput from './pages/FinanceInput';
import FinanceGoogleDocs from './pages/FinanceGoogleDocs';
import Vehicles from './pages/Vehicles';
import VehicleForm from './pages/VehicleForm';
import AssetAssignment from './pages/AssetAssignment';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import UserBBM from './pages/UserBBM';
import MasterSettings from './pages/Settings';
import { AlertCircle } from 'lucide-react';

function UnauthorizedNotice({ onBack }) {
  return (
    <div className="container-fluid py-5 px-3 text-center">
      <div className="card-clean p-4 p-md-5 bg-white mx-auto shadow-sm" style={{ maxWidth: '460px' }}>
        <div className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex p-3 mb-3">
          <AlertCircle size={36} />
        </div>
        <h5 className="fw-bold text-dark mb-1">Akses Dibatasi</h5>
        <p className="text-muted small mb-4" style={{ fontSize: '0.78rem' }}>
          Akun Anda tidak memiliki otorisasi untuk membuka modul atau formulir ini.
        </p>
        <button 
          type="button" 
          className="btn btn-primary btn-sm px-4 fw-semibold"
          onClick={onBack}
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}

function PortalMain() {
  const { currentUser, hasAccess, showToast } = useAuth();
  const isMaster = (currentUser?.role || '').toLowerCase().includes('master') || (currentUser?.role || '').toLowerCase().includes('admin');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data States
  const [comcases, setComcases] = useState([]);
  const [zoneRequests, setZoneRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);

  // Editing state for forms
  const [editingComcaseData, setEditingComcaseData] = useState(null);
  const [comcaseRejectionBanner, setComcaseRejectionBanner] = useState(null);
  const [editingEmployeeData, setEditingEmployeeData] = useState(null);
  const [editingVehicleData, setEditingVehicleData] = useState(null);

  // Modals States
  const [selectedComcase, setSelectedComcase] = useState(null);
  const [showComcaseDetailModal, setShowComcaseDetailModal] = useState(false);
  const [showComcaseApprovalModal, setShowComcaseApprovalModal] = useState(false);
  const [comcaseApprovalType, setComcaseApprovalType] = useState('zone'); // 'zone' or 'manager'
  const [comcaseApprovalInitialAction, setComcaseApprovalInitialAction] = useState('approve');
  const [showComcasePaymentModal, setShowComcasePaymentModal] = useState(false);

  const [selectedZoneRequest, setSelectedZoneRequest] = useState(null);
  const [showZoneDetailModal, setShowZoneDetailModal] = useState(false);
  const [showZoneCreateModal, setShowZoneCreateModal] = useState(false);
  const [showZonePaymentModal, setShowZonePaymentModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signingRole, setSigningRole] = useState('manager'); // 'manager', 'gm', 'owner'

  const [lightboxState, setLightboxState] = useState({ show: false, url: '', title: '', subtitle: '' });

  // Initial Fetch Data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [comRes, zoneRes, vehRes, empRes, expRes, userRes] = await Promise.allSettled([
        api.getComcases(),
        api.getZoneRequests(),
        api.getVehicles(),
        api.getEmployees(),
        api.getExpenses(),
        api.getUsers()
      ]);

      if (comRes.status === 'fulfilled' && comRes.value?.data) {
        setComcases(comRes.value.data);
      }
      if (zoneRes.status === 'fulfilled' && zoneRes.value?.data) {
        setZoneRequests(zoneRes.value.data);
      }
      if (vehRes.status === 'fulfilled' && vehRes.value?.data) {
        setVehicles(vehRes.value.data);
      }
      if (empRes.status === 'fulfilled' && empRes.value?.data) {
        setEmployees(empRes.value.data);
      }
      if (expRes.status === 'fulfilled' && expRes.value?.data) {
        setExpenses(expRes.value.data);
      }
      if (userRes.status === 'fulfilled' && userRes.value?.data) {
        setUsers(userRes.value.data);
      }
    } catch (err) {
      console.warn('Backend API offline, using cached/mock storage.', err);
    }
  };

  // Reset activeTab when user logs in, logs out, or switches account
  useEffect(() => {
    const r = (currentUser?.role || '').toLowerCase().trim();
    const u = (currentUser?.username || '').toLowerCase().trim();
    const e = (currentUser?.employee_name || '').toLowerCase().trim();
    const isField = r === 'user' || r === 'driver' || r.includes('lapangan') || u === 'driver' || u === 'lapangan' || e.includes('driver') || e.includes('lapangan');
    if (isField) {
      setActiveTab('user-bbm-validation');
    } else {
      setActiveTab('dashboard');
    }
  }, [currentUser?.username, currentUser?.role]);

  // --- Handlers for Comcases ---
  const handleSaveComcase = async (formData) => {
    try {
      if (editingComcaseData) {
        const updatedStatus = 'Menunggu Review Zone Manager';
        const payload = { ...formData, status: updatedStatus, rejectionReason: null };
        await api.updateComcase(editingComcaseData.id, payload);
        setComcases(prev => prev.map(c => c.id === editingComcaseData.id ? { ...c, ...payload } : c));
        const listRes = await api.getComcases();
        if (listRes && listRes.success && Array.isArray(listRes.data)) {
          setComcases(listRes.data);
        } else {
          setComcases(prev => prev.map(c => c.id === editingComcaseData.id ? { ...c, ...payload } : c));
        }
        showToast(`Comcase ${editingComcaseData.id} berhasil direvisi!`, 'success');
        setEditingComcaseData(null);
        setComcaseRejectionBanner(null);
      } else {
        const payload = {
          ...formData,
          status: 'Menunggu Review Zone Manager'
        };
        const res = await api.createComcase(payload);
        const listRes = await api.getComcases();
        if (listRes && listRes.success && Array.isArray(listRes.data)) {
          setComcases(listRes.data);
        } else {
          const newId = res?.data?.id || `COM-${new Date().getFullYear()}-${String(comcases.length + 1).padStart(3, '0')}`;
          const newRecord = { ...payload, id: newId };
          setComcases(prev => [newRecord, ...prev]);
        }
        showToast(`Request Comcase berhasil diajukan dan disimpan ke database!`, 'success');
      }
      setActiveTab('comcase-list');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan pengajuan Comcase.', 'error');
    }
  };

  const handleOpenComcaseApproval = (comcase, type = 'zone', initialAction = 'approve') => {
    setSelectedComcase(comcase);
    setComcaseApprovalType(type);
    setComcaseApprovalInitialAction(initialAction);
    setShowComcaseApprovalModal(true);
  };

  const handleSubmitComcaseApproval = async ({ id, approved, notes, reviewerName }) => {
    try {
      if (comcaseApprovalType === 'zone') {
        const nextStatus = approved ? 'Menunggu Approval Manager Operasional' : 'Ditolak Zone Manager';
        await api.reviewZoneComcase(id, approved, notes, reviewerName);
        setComcases(prev => prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              status: nextStatus,
              zoneManagerApproval: {
                status: approved ? 'Disetujui' : 'Ditolak',
                approvedBy: reviewerName,
                approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                notes
              }
            };
          }
          return c;
        }));
        showToast(approved ? `Comcase disetujui & diteruskan ke Manager Ops!` : `Comcase ditolak oleh Zone Manager.`, approved ? 'success' : 'warning');
      } else {
        const nextStatus = approved ? 'Disetujui Manager' : 'Ditolak Manager';
        await api.approveManagerComcase(id, approved, notes, reviewerName);
        setComcases(prev => prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              status: nextStatus,
              managerApproval: {
                status: approved ? 'Disetujui' : 'Ditolak',
                approvedBy: reviewerName,
                approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                notes
              }
            };
          }
          return c;
        }));
        showToast(approved ? `Comcase disetujui Manager & diteruskan ke Finance!` : `Comcase ditolak oleh Manager.`, approved ? 'success' : 'warning');
      }
    } catch (err) {
      showToast('Gagal memproses approval Comcase.', 'error');
    }
  };

  const handleOpenComcasePayment = (comcase) => {
    setSelectedComcase(comcase);
    setShowComcasePaymentModal(true);
  };

  const handleSubmitComcasePayment = async ({ id, paidBy, paymentDate, paymentReceipt, notes }) => {
    try {
      await api.payComcase(id, paidBy, paymentDate, paymentReceipt, notes);
      setComcases(prev => prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'Sudah Dibayar',
            financePayment: { status: 'Lunas', paidBy, paymentDate, paymentReceipt, notes }
          };
        }
        return c;
      }));
      showToast(`Pembayaran Comcase ${id} berhasil diselesaikan!`, 'success');
    } catch (err) {
      showToast('Gagal memproses pembayaran Comcase.', 'error');
    }
  };

  const handleEditRejectedComcase = (comcase) => {
    setEditingComcaseData(comcase);
    setComcaseRejectionBanner({
      reason: comcase.managerApproval?.notes || comcase.zoneManagerApproval?.notes || 'Harap perbaiki lampiran / nominal.',
      rejectedBy: comcase.status.includes('Zone') ? 'Zone Manager' : 'Manager Operasional',
      rejectedAt: comcase.managerApproval?.approvedAt || comcase.zoneManagerApproval?.approvedAt || '-'
    });
    setActiveTab('comcase-form');
  };

  const handleDeleteComcase = async (id) => {
    if (window.confirm(`Hapus pengajuan Comcase ${id}?`)) {
      try {
        await api.deleteComcase(id);
        setComcases(prev => prev.filter(c => c.id !== id));
        showToast(`Comcase ${id} berhasil dihapus.`, 'info');
      } catch (e) {}
    }
  };

  // --- Handlers for Zone Requests ---
  const handleOpenZoneSign = (request, role = 'manager') => {
    setSelectedZoneRequest(request);
    setSigningRole(role);
    setShowSignatureModal(true);
  };

  const handleSaveSignature = async ({ signerRole, signerName, signatureData, notes, isApproved }) => {
    if (!selectedZoneRequest) {
      showToast('Permohonan tidak ditemukan.', 'error');
      return;
    }
    try {
      const res = await api.signZoneRequest(
        selectedZoneRequest.id,
        signerRole,
        signerName,
        signatureData,
        notes,
        isApproved,
        isApproved ? null : notes
      );

      if (res && res.success === false) {
        showToast(res.message || 'Gagal menandatangani permohonan.', 'error');
        return;
      }

      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      setZoneRequests(prev => prev.map(r => {
        if (r.id === selectedZoneRequest.id) {
          const updated = { ...r };
          if (!isApproved) {
            updated.status = 'Ditolak';
          } else if (signerRole === 'requester') {
            updated.requester_name = signerName;
            updated.requester_signed_at = nowStr;
            updated.requester_signature = signatureData;
            updated.requester_notes = notes;
            updated.status = 'Menunggu TTD Manager';
          } else if (signerRole === 'manager') {
            updated.manager_name = signerName;
            updated.manager_signed_at = nowStr;
            updated.manager_signature = signatureData;
            updated.manager_notes = notes;
            updated.status = 'Menunggu TTD Checker (GM)';
          } else if (signerRole === 'gm') {
            updated.gm_name = signerName;
            updated.gm_signed_at = nowStr;
            updated.gm_signature = signatureData;
            updated.gm_notes = notes;
            updated.status = 'Menunggu TTD Checker (Finance)';
          } else if (signerRole === 'finance') {
            updated.finance_checker_name = signerName;
            updated.finance_checker_signed_at = nowStr;
            updated.finance_checker_signature = signatureData;
            updated.finance_checker_notes = notes;
            updated.status = 'Menunggu TTD Approval (Direksi)';
          } else if (signerRole === 'owner') {
            updated.owner_name = signerName;
            updated.owner_signed_at = nowStr;
            updated.owner_signature = signatureData;
            updated.owner_notes = notes;
            updated.status = 'Disetujui Sah Direksi (Siap Pencairan Dana)';
          }
          setSelectedZoneRequest(updated);
          return updated;
        }
        return r;
      }));

      showToast(isApproved ? `Tanda tangan digital (${signerName}) berhasil dibubuhkan!` : `Permohonan ditolak.`, isApproved ? 'success' : 'warning');
    } catch (err) {
      console.error(err);
      showToast('Gagal membubuhkan tanda tangan digital.', 'error');
    }
  };

  const handleSaveNewZoneRequest = async (formData) => {
    setShowZoneCreateModal(false);
    try {
      const requesterAcc = currentUser?.employee_name || currentUser?.name || currentUser?.username || 'Zone Manager';
      const requesterRole = currentUser?.role || 'Zone Manager';
      const defaultSignerName = requesterAcc.includes(requesterRole) ? requesterAcc : `${requesterAcc} (${requesterRole})`;

      const payload = {
        ...formData,
        requester_name: formData.requester_name || defaultSignerName
      };

      const res = await api.createZoneRequest(payload);
      const listRes = await api.getZoneRequests();
      if (listRes && listRes.success && Array.isArray(listRes.data)) {
        setZoneRequests(listRes.data);
      } else {
        const newId = res?.data?.id || Date.now();
        const reqNum = res?.data?.request_number || `REQ-EXT-${new Date().getFullYear()}-${String(zoneRequests.length + 1).padStart(3, '0')}`;
        const newRecord = {
          ...payload,
          id: newId,
          request_number: reqNum,
          status: 'Menunggu TTD Manager',
          created_at: new Date().toISOString()
        };
        setZoneRequests(prev => [newRecord, ...prev]);
      }
      showToast('Surat permohonan external dan lampiran PDF berhasil dibuat!', 'success');
      setShowZoneCreateModal(false);
      setActiveTab('manager-external-all');
    } catch (err) {
      console.error(err);
      showToast('Gagal membuat permohonan external: ' + (err.message || 'Error server'), 'error');
    }
  };

  const handleDeleteZoneRequest = async (reqId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus dokumen permohonan external ini?')) {
      return;
    }
    try {
      const res = await api.deleteZoneRequest(reqId);
      if (res && res.success === false) {
        showToast(res.message || 'Gagal menghapus dokumen dari database.', 'error');
        return;
      }
      setZoneRequests(prev => prev.filter(r => r.id !== reqId));
      showToast('Dokumen permohonan external berhasil dihapus dari database.', 'success');
      
      const listRes = await api.getZoneRequests();
      if (listRes && listRes.success && Array.isArray(listRes.data)) {
        setZoneRequests(listRes.data);
      }
    } catch (err) {
      console.error('Delete zone request error:', err);
      showToast('Terjadi kesalahan saat menghapus data permohonan external.', 'error');
    }
  };

  const handleOpenZonePayment = (req) => {
    setSelectedZoneRequest(req);
    setShowZonePaymentModal(true);
  };

  const handleSubmitZonePayment = async ({ id, paidBy, paymentDate, amount, paymentReceipt, notes }) => {
    try {
      await api.disburseZoneRequest(id, paidBy, paymentDate, notes, paymentReceipt, amount);
      setZoneRequests(prev => prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status: 'Sudah Dicairkan Finance',
            finance_paid_by: paidBy,
            finance_paid_at: `${paymentDate} 12:00:00`,
            finance_receipt: paymentReceipt,
            finance_notes: notes,
            finance_amount: amount
          };
        }
        return r;
      }));
      showToast(`Pencairan dana permohonan external berhasil diselesaikan!`, 'success');
    } catch (err) {
      showToast('Gagal memproses pencairan dana.', 'error');
    }
  };

  // --- Handlers for Vehicles, HRD, Expenses ---
  const handleSaveVehicle = async (vehData) => {
    if (vehData.id) {
      await api.updateVehicle(vehData);
      setVehicles(prev => prev.map(v => v.id === vehData.id ? vehData : v));
      showToast('Data mobil berhasil diperbarui.', 'success');
    } else {
      const newVeh = { ...vehData, id: Date.now() };
      await api.createVehicle(newVeh);
      setVehicles(prev => [...prev, newVeh]);
      showToast('Mobil baru berhasil ditambahkan.', 'success');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Hapus kendaraan ini dari armada?')) {
      await api.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      showToast('Mobil berhasil dihapus.', 'info');
    }
  };

  const handleSaveEmployee = async (empData) => {
    try {
      if (empData.id) {
        await api.updateEmployee(empData);
        setEmployees(prev => prev.map(e => e.id === empData.id ? { ...e, ...empData } : e));
        showToast('Data karyawan berhasil diperbarui.', 'success');
      } else {
        const res = await api.createEmployee(empData);
        const createdId = res?.data?.id || Date.now();
        const newEmp = { ...empData, id: createdId };
        setEmployees(prev => [newEmp, ...prev]);
        showToast('Karyawan baru berhasil ditambahkan.', 'success');
      }
    } catch (err) {
      console.error('Save employee error:', err);
      showToast('Gagal menyimpan data karyawan.', 'error');
    }
  };

  const handleDeleteEmployee = async (idOrNip) => {
    if (window.confirm('Hapus karyawan ini dari database secara permanen?')) {
      try {
        await api.deleteEmployee(idOrNip);
        setEmployees(prev => prev.filter(e => e.id !== idOrNip && e.nip !== idOrNip && e.nik !== idOrNip));
        showToast('Karyawan berhasil dihapus dari database.', 'info');
      } catch (err) {
        console.error('Delete employee error:', err);
        showToast('Gagal menghapus data karyawan.', 'error');
      }
    }
  };

  const handleSaveFinanceExpense = async (expenseData) => {
    const res = await api.createExpense(expenseData);
    if (res && res.success && res.data) {
      setExpenses(prev => [res.data, ...prev]);
    } else {
      setExpenses(prev => [expenseData, ...prev]);
    }
  };

  const handleValidateBbmExpense = async (id, validationData) => {
    try {
      const res = await api.validateBbmExpense(id, validationData);
      if (res && res.success) {
        showToast('Validasi nota BBM (3 foto) berhasil disimpan!', 'success');
        setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...(res.data || {}), status: 'Sudah Divalidasi' } : exp));
        return { success: true };
      } else {
        showToast(res?.message || 'Gagal memvalidasi nota BBM.', 'error');
        return { success: false };
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memvalidasi nota BBM.', 'error');
      return { success: false };
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const res = await api.deleteExpense(id);
      if (res && res.success) {
        showToast('Transaksi kas berhasil dihapus.', 'success');
        setExpenses(prev => prev.filter(e => e.id !== id));
        return { success: true };
      } else {
        showToast(res?.message || 'Gagal menghapus transaksi.', 'error');
        return { success: false };
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus transaksi.', 'error');
      return { success: false };
    }
  };

  const handleAssignAsset = async (assignmentData) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === assignmentData.vehicleId || v.plateNumber === assignmentData.plateNumber) {
        return {
          ...v,
          driverName: assignmentData.employeeName,
          status: 'Dipakai'
        };
      }
      return v;
    }));
  };

  const handleSaveNewUser = async (userData) => {
    try {
      const res = await api.createUser(userData);
      if (res && res.success) {
        showToast(res.message || 'Akun pengguna berhasil ditambahkan ke database!', 'success');
        const listRes = await api.getUsers();
        if (listRes && listRes.success && Array.isArray(listRes.data)) {
          setUsers(listRes.data);
        }
        return { success: true };
      } else {
        showToast(res?.message || 'Gagal menambahkan akun pengguna.', 'error');
        return { success: false, message: res?.message };
      }
    } catch (err) {
      console.error('Create user error:', err);
      showToast('Gagal menambahkan akun pengguna ke database.', 'error');
      return { success: false };
    }
  };

  const handleUpdateUserRole = async (id, role) => {
    try {
      const res = await api.updateUserRole(id, role);
      if (res && res.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
        showToast(`Role akun berhasil diperbarui menjadi ${role}.`, 'success');
      } else {
        showToast(res?.message || 'Gagal mengubah role pengguna.', 'error');
      }
    } catch (err) {
      showToast('Gagal mengubah role pengguna.', 'error');
    }
  };

  const handleChangeUserPassword = async (idOrUsername, newPassword) => {
    try {
      const payload = typeof idOrUsername === 'number' ? { id: idOrUsername, password: newPassword } : { username: idOrUsername, password: newPassword };
      const res = await api.changePassword(payload);
      if (res && res.success) {
        showToast('Password akun berhasil diperbarui di database!', 'success');
      } else {
        showToast(res?.message || 'Gagal memperbarui password.', 'error');
      }
    } catch (err) {
      showToast('Gagal memperbarui password pengguna.', 'error');
    }
  };

  // Track viewed/read timestamps per tab for active user
  const [viewedTabs, setViewedTabs] = useState(() => {
    try {
      const saved = localStorage.getItem('bsm_viewed_tabs_' + (currentUser?.username || 'user'));
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    if (currentUser?.username) {
      try {
        const saved = localStorage.getItem('bsm_viewed_tabs_' + currentUser.username);
        setViewedTabs(saved ? JSON.parse(saved) : {});
      } catch (e) {
        setViewedTabs({});
      }
    }
  }, [currentUser?.username]);

  // When activeTab changes or is currently viewed, mark it as read
  useEffect(() => {
    if (!currentUser?.username || !activeTab) return;
    const now = Date.now();
    setViewedTabs(prev => {
      const updated = { ...prev, [activeTab]: now };
      try {
        localStorage.setItem('bsm_viewed_tabs_' + currentUser.username, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [activeTab, currentUser?.username]);

  // Stats calculation (Unread indicator: only show badges for unread new items)
  const parseTime = (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const inboxLastViewed = activeTab === 'manager-inbox' ? Date.now() : (viewedTabs['manager-inbox'] || 0);
  const zoneReqLastViewed = activeTab === 'zone-requests' ? Date.now() : (viewedTabs['zone-requests'] || 0);
  const externalAllLastViewed = activeTab === 'manager-external-all' ? Date.now() : (viewedTabs['manager-external-all'] || 0);
  const financePendingLastViewed = activeTab === 'finance-pending' ? Date.now() : (viewedTabs['finance-pending'] || 0);

  const isUnread = (item, lastViewed) => {
    if (lastViewed === Date.now()) return false;
    if (!lastViewed) return true; // never opened by user yet
    const itemTime = parseTime(item.updated_at || item.created_at || item.date || item.submitted_at);
    return itemTime > lastViewed;
  };

  const curRole = (currentUser?.role || '').toLowerCase();
  const isCurGM = curRole.includes('general manager') || curRole === 'gm';
  const isCurDireksi = curRole.includes('direksi') || curRole.includes('owner');
  const isCurManager = curRole === 'manager' || curRole.includes('manager ops');
  const isCurZone = curRole.includes('zone');
  const isCurMaster = curRole.includes('master');

  const pendingGMZone = zoneRequests.filter(r => (r.status || '').toLowerCase().includes('ttd checker (gm)') || (r.manager_signed_at && !r.gm_signed_at && !r.status.includes('Ditolak'))).filter(r => isUnread(r, inboxLastViewed)).length;
  const pendingDireksiZone = zoneRequests.filter(r => (r.status || '').toLowerCase().includes('ttd approval (direksi)') || (r.finance_checker_signed_at && !r.owner_signed_at && !r.status.includes('Ditolak'))).filter(r => isUnread(r, inboxLastViewed)).length;
  const pendingManagerZone = zoneRequests.filter(r => (r.status || '').toLowerCase().includes('ttd manager') || (!r.manager_signed_at && r.requester_signed_at && !r.status.includes('Ditolak'))).filter(r => isUnread(r, inboxLastViewed)).length;
  const pendingZoneRequester = zoneRequests.filter(r => !r.requester_signed_at && !r.status.includes('Ditolak')).filter(r => isUnread(r, inboxLastViewed)).length;

  const pendingZoneComcase = comcases.filter(c => (c.status || '').toLowerCase().includes('review zone') && !c.zoneManagerApproval?.status && !c.status.includes('Ditolak')).filter(c => isUnread(c, inboxLastViewed)).length;
  const pendingManagerComcase = comcases.filter(c => ((c.status || '').toLowerCase().includes('approval manager') || (c.zoneManagerApproval?.status === 'Disetujui' && !c.managerApproval?.approvedBy)) && !c.status.includes('Ditolak')).filter(c => isUnread(c, inboxLastViewed)).length;

  let totalInboxPending = 0;
  if (activeTab === 'manager-inbox') {
    totalInboxPending = 0;
  } else if (isCurGM) {
    totalInboxPending = pendingGMZone;
  } else if (isCurDireksi) {
    totalInboxPending = pendingDireksiZone;
  } else if (isCurZone) {
    totalInboxPending = pendingZoneComcase + pendingZoneRequester;
  } else if (isCurManager) {
    totalInboxPending = pendingManagerComcase + pendingManagerZone;
  } else if (isCurMaster) {
    totalInboxPending = pendingManagerComcase + pendingManagerZone + pendingGMZone + pendingDireksiZone;
  } else {
    totalInboxPending = pendingManagerComcase;
  }

  const inboxStats = { totalPending: totalInboxPending };

  // Zone requests unread indicators
  const unreadZoneReqs = activeTab === 'zone-requests' ? 0 : zoneRequests.filter(r => !r.status.includes('Sudah Dicairkan') && !r.status.includes('Ditolak')).filter(r => isUnread(r, zoneReqLastViewed)).length;
  const unreadExternalAll = activeTab === 'manager-external-all' ? 0 : zoneRequests.filter(r => !r.status.includes('Sudah Dicairkan') && !r.status.includes('Ditolak')).filter(r => isUnread(r, externalAllLastViewed)).length;

  const zoneStats = {
    pendingTotal: unreadZoneReqs,
    unreadExternalAll: unreadExternalAll
  };

  const financePendingComcases = comcases.filter(c => ((c.status || '').toLowerCase() === 'disetujui manager' || (c.status || '').toLowerCase().includes('disetujui manager')) && isUnread(c, financePendingLastViewed)).length;
  const financePendingZoneReqs = zoneRequests.filter(r => {
    const s = (r.status || '').toLowerCase();
    if (s.includes('sudah dicairkan') || s.includes('ditolak')) return false;
    return (s.includes('disetujui owner') || s.includes('disetujui direksi') || s.includes('disetujui sah direksi') || s.includes('siap pencairan') || s.includes('menunggu pencairan') || Boolean(r.owner_signed_at)) && isUnread(r, financePendingLastViewed);
  }).length;
  const financeStats = { totalPending: activeTab === 'finance-pending' ? 0 : (financePendingComcases + financePendingZoneReqs) };

  const tabTitles = {
    'dashboard': 'Dashboard Operasional',
    'comcase-form': 'Request Comcase Baru',
    'comcase-list': 'Daftar Comcase',
    'comcase-summary': 'List Comcase',
    'zone-requests': 'Permohonan External',
    'zone-review': 'Review Comcase External',
    'manager-inbox': 'Kotak Masuk',
    'manager-comcase-all': 'Data Comcase',
    'manager-external-all': 'Data External',
    'finance-pending': 'Pembayaran Pending (Finance)',
    'finance-transactions': 'Daftar Transaksi Kas',
    'finance-input': 'Input Pengeluaran Kas',
    'finance-google-docs': 'Integrasi Google Docs',
    'user-bbm-validation': 'Validasi Nota BBM',
    'employee-list': 'Data Karyawan (HRD)',
    'employee-form': 'Formulir Karyawan',
    'vehicle-list': 'Armada Kendaraan Operasional',
    'vehicle-form': 'Formulir Armada',
    'asset-assignment': 'Penugasan Aset',
    'master-users': 'Manajemen Pengguna',
    'master-settings': 'Matriks Otoritas & API'
  };

  if (!currentUser) {
    return <Login />;
  }

  const userRole = (currentUser?.role || '').toLowerCase().trim();
  const userName = (currentUser?.username || '').toLowerCase().trim();
  const empName = (currentUser?.employee_name || '').toLowerCase().trim();
  const isFieldUser = userRole === 'user' || userRole === 'driver' || userRole.includes('lapangan') || userName === 'driver' || userName === 'lapangan' || empName.includes('driver') || empName.includes('lapangan');

  return (
    <div className="app-wrapper">
      <ToastAlert />

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        inboxStats={inboxStats}
        financeStats={financeStats}
        zoneStats={zoneStats}
        expensesCount={expenses.length}
        vehiclesCount={vehicles.length}
        employeesCount={employees.length}
      />

      <div className="main-content">
        <Navbar 
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
          activeTabTitle={tabTitles[activeTab]}
          employees={employees}
        />

        <main className="flex-grow-1">
          {activeTab === 'dashboard' && (
            isFieldUser ? (
              <UserBBM 
                vehicles={vehicles}
                expenses={expenses}
                onValidateExpense={handleValidateBbmExpense}
                onSaveBbmExpense={handleSaveFinanceExpense}
              />
            ) : (
              <Dashboard 
                comcases={comcases}
                zoneRequests={zoneRequests}
                vehicles={vehicles}
                employees={employees}
                expenses={expenses}
                setActiveTab={setActiveTab}
                onViewComcaseDetail={(com) => { setSelectedComcase(com); setShowComcaseDetailModal(true); }}
                onViewZoneDetail={(req) => { setSelectedZoneRequest(req); setShowZoneDetailModal(true); }}
              />
            )
          )}

          {activeTab === 'comcase-form' && (
            (hasAccess('Comcase', 'create') || isMaster) ? (
              <ComcaseForm 
                editingData={editingComcaseData}
                rejectedBanner={comcaseRejectionBanner}
                onSave={handleSaveComcase}
                onCancel={() => { setEditingComcaseData(null); setComcaseRejectionBanner(null); setActiveTab('comcase-list'); }}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {(activeTab === 'comcase-list' || activeTab === 'zone-review' || activeTab === 'manager-comcase-all') && (
            (activeTab === 'manager-comcase-all'
              ? (hasAccess('Inbox', 'comcase') || isMaster)
              : (hasAccess('Comcase', 'view') || hasAccess('ZoneManager', 'view') || hasAccess('Manager', 'approve') || isMaster)) ? (
              <ComcaseList 
                comcases={comcases}
                onViewDetail={(com) => { setSelectedComcase(com); setShowComcaseDetailModal(true); }}
                onOpenApproval={handleOpenComcaseApproval}
                onEditRejected={handleEditRejectedComcase}
                onDelete={handleDeleteComcase}
                onOpenPayment={handleOpenComcasePayment}
                onOpenCreate={() => { setEditingComcaseData(null); setComcaseRejectionBanner(null); setActiveTab('comcase-form'); }}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'comcase-summary' && (
            (hasAccess('Comcase', 'view') || hasAccess('Manager') || isMaster) ? (
              <ComcaseSummary 
                comcases={comcases}
                onViewComcaseDetail={(com) => { setSelectedComcase(com); setShowComcaseDetailModal(true); }}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'zone-requests' && (
            (hasAccess('ZoneManager', 'view') || hasAccess('Manager') || hasAccess('Finance') || isMaster) ? (
              <ZoneRequests 
                zoneRequests={zoneRequests}
                onViewDetail={(req) => { setSelectedZoneRequest(req); setShowZoneDetailModal(true); }}
                onOpenSign={handleOpenZoneSign}
                onOpenCreate={() => setShowZoneCreateModal(true)}
                onDelete={handleDeleteZoneRequest}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'manager-inbox' && (
            (hasAccess('Inbox', 'view') || isMaster) ? (
              <ManagerInbox 
                comcases={comcases}
                zoneRequests={zoneRequests}
                onViewComcaseDetail={(com) => { setSelectedComcase(com); setShowComcaseDetailModal(true); }}
                onViewZoneDetail={(req) => { setSelectedZoneRequest(req); setShowZoneDetailModal(true); }}
                onOpenComcaseApproval={handleOpenComcaseApproval}
                onOpenComcasePayment={handleOpenComcasePayment}
                onOpenZoneSign={handleOpenZoneSign}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'manager-external-all' && (
            (hasAccess('Inbox', 'external') || isMaster) ? (
              <ManagerExternalAll 
                zoneRequests={zoneRequests}
                onViewDetail={(req) => { setSelectedZoneRequest(req); setShowZoneDetailModal(true); }}
                onOpenSign={handleOpenZoneSign}
                onDelete={handleDeleteZoneRequest}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'finance-pending' && (
            (hasAccess('Finance') || isMaster) ? (
              <FinancePending 
                comcases={comcases}
                zoneRequests={zoneRequests}
                onViewComcaseDetail={(com) => { setSelectedComcase(com); setShowComcaseDetailModal(true); }}
                onViewZoneDetail={(req) => { setSelectedZoneRequest(req); setShowZoneDetailModal(true); }}
                onOpenComcasePayment={handleOpenComcasePayment}
                onOpenZonePayment={handleOpenZonePayment}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'finance-transactions' && (
            (hasAccess('Finance', 'view') || isMaster) ? (
              <FinanceTransactions 
                expenses={expenses}
                onOpenInput={() => setActiveTab('finance-input')}
                onOpenGoogleDocs={() => setActiveTab('finance-google-docs')}
                onDeleteExpense={handleDeleteExpense}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'finance-input' && (
            (hasAccess('Finance', 'create') || isMaster) ? (
              <FinanceInput 
                vehicles={vehicles}
                employees={employees}
                onSave={handleSaveFinanceExpense}
                onCancel={() => setActiveTab('finance-transactions')}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'finance-google-docs' && (
            (hasAccess('Finance') || isMaster) ? (
              <FinanceGoogleDocs 
                expenses={expenses}
                comcases={comcases}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'user-bbm-validation' && (
            (hasAccess('User', 'bbm') || hasAccess('Vehicle') || isMaster) ? (
              <UserBBM 
                vehicles={vehicles}
                expenses={expenses}
                onValidateExpense={handleValidateBbmExpense}
                onSaveBbmExpense={handleSaveFinanceExpense}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'employee-list' && (
            (hasAccess('HRD', 'view') || isMaster) ? (
              <Employees 
                employees={employees}
                onSaveEmployee={handleSaveEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onOpenAddEmployee={() => { setEditingEmployeeData(null); setActiveTab('employee-form'); }}
                onOpenEditEmployee={(emp) => { setEditingEmployeeData(emp); setActiveTab('employee-form'); }}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'employee-form' && (
            ((editingEmployeeData ? hasAccess('HRD', 'edit') : hasAccess('HRD', 'create')) || isMaster) ? (
              <EmployeeForm 
                editingEmployee={editingEmployeeData}
                existingEmployees={employees}
                onSave={handleSaveEmployee}
                onCancel={() => { setEditingEmployeeData(null); setActiveTab('employee-list'); }}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'vehicle-list' && (
            (hasAccess('Vehicle', 'view') || isMaster) ? (
              <Vehicles 
                vehicles={vehicles}
                onSaveVehicle={handleSaveVehicle}
                onDeleteVehicle={handleDeleteVehicle}
                onOpenAddVehicle={() => { setEditingVehicleData(null); setActiveTab('vehicle-form'); }}
                onOpenEditVehicle={(veh) => { setEditingVehicleData(veh); setActiveTab('vehicle-form'); }}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'vehicle-form' && (
            ((editingVehicleData ? hasAccess('Vehicle', 'edit') : hasAccess('Vehicle', 'create')) || isMaster) ? (
              <VehicleForm 
                editingVehicle={editingVehicleData}
                employees={employees}
                onSave={handleSaveVehicle}
                onCancel={() => { setEditingVehicleData(null); setActiveTab('vehicle-list'); }}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {activeTab === 'asset-assignment' && (
            (hasAccess('Vehicle', 'assign') || isMaster) ? (
              <AssetAssignment 
                vehicles={vehicles}
                employees={employees}
                onAssignAsset={handleAssignAsset}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}

          {(activeTab === 'master-users' || activeTab === 'master-settings') && (
            isMaster ? (
              <MasterSettings 
                users={users}
                employees={employees}
                initialTab={activeTab === 'master-settings' ? 'roles' : 'users'}
                onAddUser={handleSaveNewUser}
                onUpdateUserRole={handleUpdateUserRole}
                onChangeUserPassword={handleChangeUserPassword}
                onSaveRoles={(r) => api.saveSettings({ customRoles: r })}
              />
            ) : (
              <UnauthorizedNotice onBack={() => setActiveTab('dashboard')} />
            )
          )}
        </main>

        <BottomNav 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          inboxStats={inboxStats}
          financeStats={financeStats}
        />
      </div>

      {/* Modals */}
      <ComcaseDetailModal 
        show={showComcaseDetailModal}
        comcase={selectedComcase}
        onClose={() => setShowComcaseDetailModal(false)}
        onOpenApproval={handleOpenComcaseApproval}
        onOpenPayment={handleOpenComcasePayment}
        onOpenLightbox={(url, title, subtitle) => setLightboxState({ show: true, url, title, subtitle })}
      />

      <ComcaseApprovalModal 
        show={showComcaseApprovalModal}
        comcase={selectedComcase}
        approvalType={comcaseApprovalType}
        initialAction={comcaseApprovalInitialAction}
        onClose={() => setShowComcaseApprovalModal(false)}
        onSubmit={handleSubmitComcaseApproval}
      />

      <ComcasePaymentModal 
        show={showComcasePaymentModal}
        comcase={selectedComcase}
        onClose={() => setShowComcasePaymentModal(false)}
        onSubmit={handleSubmitComcasePayment}
      />

      <ZoneDetailModal 
        show={showZoneDetailModal}
        request={selectedZoneRequest}
        onClose={() => setShowZoneDetailModal(false)}
        onOpenSign={handleOpenZoneSign}
        onOpenDisburse={handleOpenZonePayment}
      />

      <ZoneCreateModal 
        show={showZoneCreateModal}
        onClose={() => setShowZoneCreateModal(false)}
        onSubmit={handleSaveNewZoneRequest}
      />

      <ZonePaymentModal 
        show={showZonePaymentModal}
        request={selectedZoneRequest}
        onClose={() => setShowZonePaymentModal(false)}
        onSubmit={handleSubmitZonePayment}
      />

      <SignatureModal 
        show={showSignatureModal}
        signingRole={signingRole}
        requestData={selectedZoneRequest}
        onClose={() => setShowSignatureModal(false)}
        onSave={handleSaveSignature}
      />

      <LightboxModal 
        show={lightboxState.show}
        url={lightboxState.url}
        title={lightboxState.title}
        subtitle={lightboxState.subtitle}
        onClose={() => setLightboxState(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PortalMain />
    </AuthProvider>
  );
}
