import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  Key, 
  User, 
  Lock, 
  X, 
  Check, 
  Eye, 
  EyeOff,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ onToggleMobileSidebar, activeTabTitle, employees = [] }) {
  const { currentUser, logout, login, showToast } = useAuth();

  // State Change Password Modal & Employee Profile Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Find linked employee data by name or NIP
  const matchedEmployee = (employees || []).find(emp => {
    const empName = (emp.name || '').toLowerCase().trim();
    const curEmpName = (currentUser?.employee_name || '').toLowerCase().trim();
    const curName = (currentUser?.name || '').toLowerCase().trim();
    const curUsername = (currentUser?.username || '').toLowerCase().trim();
    const empNip = (emp.nip || emp.nik || '').toLowerCase().trim();

    return (curEmpName && empName === curEmpName) || 
           (curName && empName === curName) || 
           (curUsername && empNip && empNip === curUsername);
  });

  const handleQuickRoleSwitch = (username) => {
    login(username, '123456');
  };

  const displayName = currentUser?.employee_name || currentUser?.username || 'User';
  const initialLetter = (displayName || 'U')[0].toUpperCase();

  const handleOpenPasswordModal = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword) {
      showToast('Password baru tidak boleh kosong.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      showToast('Password minimal 4 karakter.', 'warning');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Konfirmasi password tidak cocok dengan password baru.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.changePassword({
        id: currentUser?.id,
        username: currentUser?.username,
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword
      });

      if (res && res.success) {
        showToast('✓ Password Anda berhasil diperbarui!', 'success');
        setShowPasswordModal(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(res?.message || 'Gagal mengubah password.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat mengubah password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand navbar-light bg-white border-bottom sticky-top px-3 py-2" style={{ zIndex: 1010, height: '54px' }}>
        <div className="container-fluid px-0">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="d-flex align-items-center gap-2">
            <button 
              className="btn btn-sm btn-light d-md-none p-1 border-0" 
              onClick={onToggleMobileSidebar}
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>

            <div className="d-flex align-items-center gap-2">
              <h6 className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: '0.875rem' }}>
                {activeTabTitle || 'Dashboard Operasional'}
              </h6>
            </div>
          </div>

          {/* Right: Quick Role Switch & Clean User Profile */}
          <div className="d-flex align-items-center gap-2">
            {/* Quick Demo Switcher */}
            <div className="dropdown d-none d-lg-block">
              <button className="btn btn-sm btn-light border py-1 px-2.5 d-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }} data-bs-toggle="dropdown">
                <ShieldCheck size={14} className="text-primary" />
                <span>Ganti Akun Demo</span>
                <ChevronDown size={12} className="text-muted ms-0.5" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm border py-1" style={{ fontSize: '0.78rem' }}>
                <li><h6 className="dropdown-header py-1" style={{ fontSize: '0.7rem' }}>Pilih Akun Demo</h6></li>
                <li><button className="dropdown-item py-1.5" onClick={() => handleQuickRoleSwitch('master')}>👑 Master Admin</button></li>
                <li><button className="dropdown-item py-1.5" onClick={() => handleQuickRoleSwitch('direksi')}>🏛️ Direksi (direksi)</button></li>
                <li><button className="dropdown-item py-1.5" onClick={() => handleQuickRoleSwitch('gm')}>👔 General Manager (gm)</button></li>
                <li><button className="dropdown-item py-1.5" onClick={() => handleQuickRoleSwitch('pandu')}>🛡️ Manager (Pandu)</button></li>
                <li><button className="dropdown-item py-1.5" onClick={() => handleQuickRoleSwitch('boya')}>🌐 Zone Manager (Boya)</button></li>
                <li><button className="dropdown-item py-1.5" onClick={() => handleQuickRoleSwitch('cristian')}>📌 Supervisor (Cristian)</button></li>
                <li><button className="dropdown-item py-1.5" onClick={() => handleQuickRoleSwitch('tl')}>⚡ Team Leader (Ahmad Fauzi)</button></li>
                <li><button className="dropdown-item py-1.5" onClick={() => handleQuickRoleSwitch('driver')}>🚗 Lapangan / Driver (Joko)</button></li>
                <li><button className="dropdown-item py-1.5" onClick={() => handleQuickRoleSwitch('himawan')}>💰 Finance (Himawan)</button></li>
                <li><button className="dropdown-item py-1.5" onClick={() => handleQuickRoleSwitch('septika')}>👥 HRD (Septika)</button></li>
              </ul>
            </div>

            {/* Clean User Profile Pill (No Role Subtext) */}
            <div className="dropdown">
              <button 
                className="btn btn-sm btn-light border d-flex align-items-center gap-2 py-1 px-2.5 rounded-pill shadow-2xs cursor-pointer" 
                data-bs-toggle="dropdown"
                style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}
              >
                <div 
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-2xs" 
                  style={{ width: 26, height: 26, fontSize: '0.78rem' }}
                >
                  {initialLetter}
                </div>
                <span className="fw-bold text-dark d-none d-sm-inline-block text-truncate" style={{ fontSize: '0.8rem', maxWidth: '130px' }}>
                  {displayName}
                </span>
                <ChevronDown size={13} className="text-muted" />
              </button>

              <ul className="dropdown-menu dropdown-menu-end shadow border py-1.5" style={{ minWidth: '220px', borderRadius: '10px' }}>
                {/* Header User Card */}
                <li className="px-3 py-2 border-bottom bg-light bg-opacity-50">
                  <div className="d-flex align-items-center gap-2">
                    <div 
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-2xs" 
                      style={{ width: 32, height: 32, fontSize: '0.85rem' }}
                    >
                      {initialLetter}
                    </div>
                    <div className="text-truncate">
                      <strong className="d-block text-dark text-truncate" style={{ fontSize: '0.82rem' }}>
                        {displayName}
                      </strong>
                      <small className="text-muted font-mono d-block text-truncate" style={{ fontSize: '0.68rem' }}>
                        @{currentUser?.username || 'user'}
                      </small>
                    </div>
                  </div>
                </li>

                {/* Profil Data Pegawai Button */}
                <li>
                  <button 
                    type="button" 
                    className="dropdown-item py-2 px-3 text-dark d-flex align-items-center gap-2" 
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => setShowProfileModal(true)}
                  >
                    <User size={14} className="text-primary" />
                    <span>Profil Data Pegawai</span>
                  </button>
                </li>

                {/* Change Password Button */}
                <li>
                  <button 
                    type="button" 
                    className="dropdown-item py-2 px-3 text-dark d-flex align-items-center gap-2" 
                    style={{ fontSize: '0.78rem' }}
                    onClick={handleOpenPasswordModal}
                  >
                    <Key size={14} className="text-primary" />
                    <span>Ubah Password Akun</span>
                  </button>
                </li>

                {/* Logout Button */}
                <li className="border-top mt-1 pt-1">
                  <button 
                    type="button" 
                    className="dropdown-item py-2 px-3 text-danger d-flex align-items-center gap-2" 
                    style={{ fontSize: '0.78rem' }}
                    onClick={logout}
                  >
                    <LogOut size={14} />
                    <span>Keluar Portal</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Interactive Modal: Ubah Password Sendiri */}
      {showPasswordModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              {/* Header */}
              <div className="modal-header bg-dark text-white py-2.5 px-3.5">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-primary bg-opacity-25 text-white p-1.5">
                    <Key size={16} />
                  </div>
                  <div>
                    <h6 className="modal-title fw-bold mb-0 text-white" style={{ fontSize: '0.9rem' }}>
                      Ubah Password Akun
                    </h6>
                    <small className="text-secondary" style={{ fontSize: '0.68rem' }}>
                      @{currentUser?.username} &bull; {displayName}
                    </small>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPasswordModal(false)}></button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitPasswordChange}>
                <div className="modal-body p-3.5">
                  <div className="mb-2.5">
                    <label className="form-label text-muted fw-bold mb-1" style={{ fontSize: '0.72rem' }}>
                      Password Lama (Jika ada):
                    </label>
                    <input 
                      type={showPasswordText ? "text" : "password"}
                      className="form-control form-control-sm form-control-clean"
                      style={{ fontSize: '0.8rem' }}
                      placeholder="Masukkan password saat ini..."
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    />
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label text-muted fw-bold mb-1" style={{ fontSize: '0.72rem' }}>
                      Password Baru: <span className="text-danger">*</span>
                    </label>
                    <input 
                      type={showPasswordText ? "text" : "password"}
                      className="form-control form-control-sm form-control-clean"
                      style={{ fontSize: '0.8rem' }}
                      placeholder="Minimal 4 karakter..."
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted fw-bold mb-1" style={{ fontSize: '0.72rem' }}>
                      Konfirmasi Password Baru: <span className="text-danger">*</span>
                    </label>
                    <input 
                      type={showPasswordText ? "text" : "password"}
                      className="form-control form-control-sm form-control-clean"
                      style={{ fontSize: '0.8rem' }}
                      placeholder="Ulangi password baru..."
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-1">
                    <button 
                      type="button" 
                      className="btn btn-sm btn-link p-0 text-muted text-decoration-none d-flex align-items-center gap-1"
                      style={{ fontSize: '0.72rem' }}
                      onClick={() => setShowPasswordText(!showPasswordText)}
                    >
                      {showPasswordText ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showPasswordText ? 'Sembunyikan' : 'Tampilkan Karakter'}</span>
                    </button>
                    {passwordForm.newPassword && passwordForm.confirmPassword && (
                      <span className={`text-xs fw-semibold ${passwordForm.newPassword === passwordForm.confirmPassword ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.7rem' }}>
                        {passwordForm.newPassword === passwordForm.confirmPassword ? '✓ Password cocok' : '✕ Password berbeda'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="modal-footer bg-light py-2 px-3.5 border-top d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-light btn-sm border fw-semibold"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setShowPasswordModal(false)}
                    disabled={savingPassword}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-sm fw-semibold d-flex align-items-center gap-1.5 shadow-2xs"
                    style={{ fontSize: '0.75rem' }}
                    disabled={savingPassword}
                  >
                    <Check size={14} />
                    <span>{savingPassword ? 'Menyimpan...' : 'Simpan Password Baru'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal: Profil Data Pegawai */}
      {showProfileModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              {/* Header */}
              <div className="modal-header bg-primary text-white py-3 px-4">
                <div className="d-flex align-items-center gap-3">
                  {matchedEmployee?.photo_preview || matchedEmployee?.photo_url ? (
                    <img 
                      src={matchedEmployee.photo_preview || matchedEmployee.photo_url} 
                      alt={displayName} 
                      className="rounded-circle border border-2 border-white shadow-2xs" 
                      style={{ width: 46, height: 46, objectFit: 'cover' }} 
                    />
                  ) : (
                    <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-black shadow-2xs" style={{ width: 46, height: 46, fontSize: '1.15rem' }}>
                      {initialLetter}
                    </div>
                  )}
                  <div>
                    <h6 className="modal-title fw-bold mb-0 text-white" style={{ fontSize: '0.98rem' }}>
                      {matchedEmployee?.name || displayName}
                    </h6>
                    <small className="text-white text-opacity-80" style={{ fontSize: '0.72rem' }}>
                      ID: <strong className="font-mono text-white">{matchedEmployee?.nip || matchedEmployee?.nik || 'BST-0001'}</strong> &bull; {matchedEmployee?.position || currentUser?.role || 'Staff'} ({matchedEmployee?.department || (matchedEmployee?.employeeType === 'Back Office' ? 'HRD' : 'Member')})
                    </small>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowProfileModal(false)}></button>
              </div>

              {/* Body */}
              <div className="modal-body p-3.5 small">
                {matchedEmployee ? (
                  <div className="row g-2.5">
                    {/* Kepegawaian & Jabatan */}
                    <div className="col-12">
                      <div className="p-3 bg-light rounded-3 border">
                        <span className="text-primary fw-bold d-block mb-2 pb-1 border-bottom" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                          Status Kepegawaian &amp; Jabatan
                        </span>
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted">Jabatan:</span>
                          <strong className="text-dark">{matchedEmployee.position || '-'}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted">Divisi / Departemen:</span>
                          <span className="badge-soft badge-soft-primary fw-bold">{matchedEmployee.department || (matchedEmployee.employeeType === 'Back Office' ? 'HRD' : 'Member')}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted">Tipe Karyawan:</span>
                          <span className="badge-soft badge-soft-slate">{matchedEmployee.employeeType || matchedEmployee.employee_type || 'Field Worker'}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted">Status Kepegawaian:</span>
                          <span className={`badge-soft ${matchedEmployee.status === 'Cuti' ? 'badge-soft-warning' : matchedEmployee.status === 'Resign' ? 'badge-soft-danger' : 'badge-soft-success'}`}>
                            {matchedEmployee.status === 'Cuti' ? '☕ Cuti' : matchedEmployee.status === 'Resign' ? '✕ Resign' : '✓ Status Aktif'}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Kontrak PKWT:</span>
                          <span className="font-mono text-dark">{matchedEmployee.pkwtDurationMonths || matchedEmployee.pkwt_duration_months || 12} Bulan (s/d {matchedEmployee.pkwtEndDate || matchedEmployee.pkwt_end_date || '-'})</span>
                        </div>
                      </div>
                    </div>

                    {/* Biodata Pribadi */}
                    <div className="col-12">
                      <div className="p-3 bg-light rounded-3 border">
                        <span className="text-primary fw-bold d-block mb-2 pb-1 border-bottom" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                          Biodata &amp; Kependudukan
                        </span>
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted">Nomor KTP (NIK):</span>
                          <span className="font-mono text-dark">{matchedEmployee.ktpNik || matchedEmployee.nik || '-'}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted">Tempat, Tgl Lahir:</span>
                          <span className="text-dark">{matchedEmployee.birthPlace || '-'}, {matchedEmployee.birthDate || '-'}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Alamat Domisili:</span>
                          <span className="text-dark text-end" style={{ maxWidth: '65%' }}>{matchedEmployee.address || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Info Akun Sistem */}
                    <div className="col-12">
                      <div className="p-2.5 bg-white rounded-3 border d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Akun Login Portal</small>
                          <span className="fw-bold font-mono text-primary" style={{ fontSize: '0.8rem' }}>@{currentUser?.username}</span>
                        </div>
                        <span className="badge bg-primary text-white px-2.5 py-1 rounded" style={{ fontSize: '0.72rem' }}>
                          Role: {currentUser?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="rounded-circle bg-light d-inline-flex p-3 text-muted mb-2">
                      <User size={32} />
                    </div>
                    <h6 className="fw-bold text-dark mb-1">{displayName}</h6>
                    <p className="text-muted mb-2 font-mono" style={{ fontSize: '0.75rem' }}>@{currentUser?.username} &bull; {currentUser?.role}</p>
                    <div className="alert alert-info py-2 px-3 small mb-0 text-start" style={{ fontSize: '0.75rem' }}>
                      ℹ️ Akun ini belum terhubung dengan data karyawan di menu <strong>Karyawan / HRD</strong>. Saat membuat akun di Manajemen Pengguna, pilih nama karyawan dari daftar master agar otomatis terhubung.
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer bg-light py-2.5 px-4 border-top d-flex justify-content-end">
                <button type="button" className="btn btn-sm btn-primary px-3 fw-semibold" onClick={() => setShowProfileModal(false)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
