import React, { useState, useEffect } from 'react';
import { useAuth, DEFAULT_CUSTOM_ROLES } from '../context/AuthContext';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Check, 
  Key, 
  Plus, 
  Trash2, 
  Search, 
  Lock, 
  FileText, 
  DollarSign, 
  Truck, 
  UserPlus, 
  CheckCircle2, 
  Sliders,
  Sparkles,
  PenTool,
  X,
  Inbox
} from 'lucide-react';

export default function MasterSettings({ 
  users, 
  employees = [], 
  initialTab, 
  onAddUser, 
  onUpdateUserRole, 
  onChangeUserPassword, 
  onDeleteUser, 
  onSaveRoles 
}) {
  const { customRoles, setCustomRoles, showToast } = useAuth();
  
  // Tampilan Awal: Akun Pengguna Aktif or Matriks (synced with initialTab)
  const [activeTab, setActiveTab] = useState(initialTab || 'users');
  const [searchUser, setSearchUser] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isManualName, setIsManualName] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: 'password123',
    employee_name: '',
    role: 'User'
  });
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Roles permission matrix state
  const [rolesList, setRolesList] = useState(() => {
    const list = customRoles || DEFAULT_CUSTOM_ROLES;
    return list.map(r => {
      let p = [...(r.permissions || [])];
      if ((r.id === 'role_hrd' || r.name === 'HRD') && !p.includes('vehicle_assign')) {
        p.push('vehicle_assign');
      }
      if (['role_manager', 'role_gm', 'role_direksi', 'role_zone_mgr'].includes(r.id)) {
        if (!p.includes('inbox_view')) p.push('inbox_view');
        if (!p.includes('inbox_comcase')) p.push('inbox_comcase');
        if (!p.includes('inbox_external')) p.push('inbox_external');
      }
      if (r.id === 'role_fin') {
        if (!p.includes('inbox_comcase')) p.push('inbox_comcase');
        if (!p.includes('inbox_external')) p.push('inbox_external');
      }
      return { ...r, permissions: p };
    });
  });

  useEffect(() => {
    if (customRoles) {
      setRolesList(customRoles.map(r => {
        let p = [...(r.permissions || [])];
        if ((r.id === 'role_hrd' || r.name === 'HRD') && !p.includes('vehicle_assign')) {
          p.push('vehicle_assign');
        }
        if (['role_manager', 'role_gm', 'role_direksi', 'role_zone_mgr'].includes(r.id)) {
          if (!p.includes('inbox_view')) p.push('inbox_view');
          if (!p.includes('inbox_comcase')) p.push('inbox_comcase');
          if (!p.includes('inbox_external')) p.push('inbox_external');
        }
        if (r.id === 'role_fin') {
          if (!p.includes('inbox_comcase')) p.push('inbox_comcase');
          if (!p.includes('inbox_external')) p.push('inbox_external');
        }
        return { ...r, permissions: p };
      }));
    }
  }, [customRoles]);

  // Clean, structured and easy-to-understand permission groups
  const PERMISSION_GROUPS = [
    {
      groupTitle: '1. Modul Kotak Masuk (Inbox) & Monitoring Terpadu',
      groupIcon: <Inbox size={16} className="text-primary" />,
      items: [
        { key: 'inbox_view', title: 'Akses Menu Kotak Masuk', desc: 'Izin membuka antrian kotak masuk untuk approval persetujuan Comcase dan TTD berkas' },
        { key: 'inbox_comcase', title: 'Akses Data Comcase (Kotak Masuk)', desc: 'Izin memantau seluruh rekapitulasi data Comcase operasional di menu Kotak Masuk' },
        { key: 'inbox_external', title: 'Akses Data External (Kotak Masuk)', desc: 'Izin memantau seluruh rekapitulasi surat permohonan external di menu Kotak Masuk' }
      ]
    },
    {
      groupTitle: '2. Modul Operasional & Pengajuan Comcase',
      groupIcon: <FileText size={16} className="text-primary" />,
      items: [
        { key: 'comcase_create', title: 'Buat Request Comcase', desc: 'Izin mengisi formulir pengajuan dana operasional baru (Supervisor)' },
        { key: 'comcase_view', title: 'Akses Daftar Comcase', desc: 'Izin memantau riwayat seluruh status pengajuan tim' },
        { key: 'comcase_approve', title: 'Approval / Review Comcase', desc: 'Otorisasi persetujuan pengajuan (Zone Mgr & Manager)' }
      ]
    },
    {
      groupTitle: '3. Modul Dokumen Permohonan External & Tanda Tangan PDF (5-Tahap)',
      groupIcon: <ShieldCheck size={16} className="text-info" />,
      items: [
        { key: 'zone_request_create', title: 'Upload Permohonan External PDF', desc: 'Izin mengunggah berkas permohonan external baru (Zone Mgr)' },
        { key: 'zone_request_view', title: 'Akses Dokumen Permohonan External', desc: 'Izin melihat daftar & status dokumen permohonan external' },
        { key: 'zone_sign_requester', title: 'TTD 1. Requester (Zone Manager)', desc: 'Tanda tangan digital pengajuan awal tingkat Zona' },
        { key: 'zone_sign_manager', title: 'TTD 2. Checker (Manager)', desc: 'Tanda tangan digital persetujuan tingkat Manager' },
        { key: 'zone_sign_gm', title: 'TTD 3. Checker 1 (General Manager)', desc: 'Tanda tangan digital pemeriksaan tingkat General Manager' },
        { key: 'zone_sign_finance', title: 'TTD 4. Checker 2 (Finance)', desc: 'Tanda tangan digital verifikasi anggaran tingkat Finance' },
        { key: 'zone_sign_owner', title: 'TTD 5. Approval Final (Direksi / Owner)', desc: 'Tanda tangan digital otorisasi tertinggi sebelum pencairan dana' }
      ]
    },
    {
      groupTitle: '4. Modul Keuangan & Kas Operasional (Finance)',
      groupIcon: <DollarSign size={16} className="text-success" />,
      items: [
        { key: 'expense_view', title: 'Lihat Rekapitulasi Kas & Transaksi', desc: 'Akses laporan pengeluaran (BBM, Tol, Tools, Makan Inap)' },
        { key: 'expense_create', title: 'Input Transaksi Pengeluaran Kas', desc: 'Izin mencatat transaksi pengeluaran kas operasional (Finance)' },
        { key: 'comcase_pay', title: 'Pencairan Dana Comcase & External', desc: 'Otorisasi kasir finance untuk membayar dan mengunggah bukti transfer' }
      ]
    },
    {
      groupTitle: '5. Modul HRD, Personalia & Kontrak Karyawan',
      groupIcon: <Users size={16} className="text-warning-emphasis" />,
      items: [
        { key: 'hrd_employee_view', title: 'Lihat List Data Karyawan', desc: 'Akses membuka modul & melihat tabel data karyawan personalia serta notifikasi alert H-30' },
        { key: 'hrd_employee_create', title: 'Pendaftaran Karyawan Baru (BST-XXXX)', desc: 'Izin mendaftarkan profil karyawan & pas foto lingkaran' },
        { key: 'hrd_employee_edit', title: 'Edit Profil & Kontrak Karyawan', desc: 'Izin mengubah masa kontrak PKWT, jabatan, dan data personalia' },
        { key: 'hrd_employee_delete', title: 'Hapus Data Profil Karyawan', desc: 'Izin menghapus berkas data karyawan dari sistem' }
      ]
    },
    {
      groupTitle: '6. Modul Armada Kendaraan & Validasi Lapangan',
      groupIcon: <Truck size={16} className="text-secondary" />,
      items: [
        { key: 'vehicle_view', title: 'Lihat Daftar Armada Mobil', desc: 'Akses memantau data unit dan membuka foto barcode BBM' },
        { key: 'vehicle_create', title: 'Pendaftaran & Pemeriksaan Unit Mobil', desc: 'Izin menambah unit armada, checklist alat & upload BAST' },
        { key: 'vehicle_assign', title: 'Penugasan Aset (Handover Unit & Inventaris)', desc: 'Izin menyerahkan dan menugaskan unit kendaraan / inventaris kepada karyawan' },
        { key: 'bbm_validation', title: 'Validasi Nota BBM (3 Foto Lapangan)', desc: 'Izin mengunggah foto struk BBM, odometer, dan nomor barcode' }
      ]
    }
  ];

  const handleTogglePerm = (roleId, permKey) => {
    const updated = rolesList.map(r => {
      if (r.id === roleId) {
        const currentPerms = r.permissions || [];
        const nextPerms = currentPerms.includes(permKey)
          ? currentPerms.filter(p => p !== permKey)
          : [...currentPerms, permKey];
        return { ...r, permissions: nextPerms };
      }
      return r;
    });
    setRolesList(updated);
    setCustomRoles(updated);
    localStorage.setItem('bsm_custom_roles', JSON.stringify(updated));
  };

  // Toggle all permissions for a specific role
  const handleToggleAllForRole = (roleId, enableAll) => {
    const allPermKeys = PERMISSION_GROUPS.flatMap(g => g.items.map(i => i.key));
    const updated = rolesList.map(r => {
      if (r.id === roleId) {
        return { ...r, permissions: enableAll ? allPermKeys : [] };
      }
      return r;
    });
    setRolesList(updated);
    setCustomRoles(updated);
    localStorage.setItem('bsm_custom_roles', JSON.stringify(updated));
    showToast(enableAll ? 'Semua hak akses dicentang!' : 'Semua hak akses dinonaktifkan.', 'info');
  };

  const handleResetToDefault = () => {
    setRolesList(DEFAULT_CUSTOM_ROLES);
    setCustomRoles(DEFAULT_CUSTOM_ROLES);
    localStorage.setItem('bsm_custom_roles', JSON.stringify(DEFAULT_CUSTOM_ROLES));
    showToast('Matriks hak akses berhasil di-reset ke standar sistem!', 'success');
  };

  const handleSaveRoles = () => {
    setCustomRoles(rolesList);
    localStorage.setItem('bsm_custom_roles', JSON.stringify(rolesList));
    if (onSaveRoles) onSaveRoles(rolesList);
    showToast('Matriks hak akses peran berhasil disimpan ke sistem!', 'success');
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserForm.username.trim() || !newUserForm.employee_name.trim()) {
      showToast('Username dan nama lengkap pegawai wajib diisi.', 'error');
      return;
    }

    setSavingUser(true);
    try {
      if (onAddUser) {
        const res = await onAddUser(newUserForm);
        if (res && res.success !== false) {
          setShowAddUserModal(false);
          setNewUserForm({
            username: '',
            password: 'password123',
            employee_name: '',
            role: 'User'
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingUser(false);
    }
  };

  // Filtered users
  const filteredUsers = (users || []).filter(u => {
    if (!searchUser.trim()) return true;
    const q = searchUser.toLowerCase();
    return (u.username && u.username.toLowerCase().includes(q)) ||
           (u.employee_name && u.employee_name.toLowerCase().includes(q)) ||
           (u.name && u.name.toLowerCase().includes(q)) ||
           (u.role && u.role.toLowerCase().includes(q));
  });

  const getRoleBadge = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('master')) return 'badge-soft-danger';
    if (r.includes('direksi')) return 'badge-soft-primary';
    if (r.includes('general manager') || r === 'gm') return 'badge-soft-purple';
    if (r.includes('manager') && !r.includes('zone')) return 'badge-soft-info';
    if (r.includes('zone')) return 'badge-soft-warning';
    if (r.includes('supervisor')) return 'badge-soft-warning';
    if (r.includes('finance')) return 'badge-soft-success';
    if (r.includes('hrd')) return 'badge-soft-secondary';
    return 'badge-soft-slate';
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark mb-0.5" style={{ letterSpacing: '-0.02em' }}>
            Manajemen Pengguna &amp; Matriks Hak Akses
          </h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
            Kelola akun pengguna aktif, penugasan role (Supervisor, Manager, GM, Finance, Direksi, HRD, User), dan matriks otorisasi fitur portal.
          </p>
        </div>
        <div>
          <button 
            type="button"
            className="btn btn-primary btn-sm fw-bold d-flex align-items-center gap-1.5 shadow-2xs"
            style={{ fontSize: '0.78rem' }}
            onClick={() => setShowAddUserModal(true)}
          >
            <UserPlus size={14} />
            <span>+ Tambah Akun Pengguna</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <button 
          type="button"
          className={`btn btn-sm py-1.5 px-3 fw-bold d-flex align-items-center gap-1.5 rounded-2 shadow-2xs ${
            activeTab === 'users' ? 'btn-primary' : 'btn-light border text-muted'
          }`}
          style={{ fontSize: '0.78rem' }}
          onClick={() => setActiveTab('users')}
        >
          <Users size={14} />
          <span>1. Akun Pengguna Aktif ({users?.length || 0})</span>
        </button>

        <button 
          type="button"
          className={`btn btn-sm py-1.5 px-3 fw-bold d-flex align-items-center gap-1.5 rounded-2 shadow-2xs ${
            activeTab === 'roles' ? 'btn-primary' : 'btn-light border text-muted'
          }`}
          style={{ fontSize: '0.78rem' }}
          onClick={() => setActiveTab('roles')}
        >
          <ShieldCheck size={14} />
          <span>2. Matriks Hak Akses &amp; Otorisasi Fitur</span>
        </button>
      </div>

      {/* TAB 1: AKUN PENGGUNA AKTIF (DEFAULT VIEW) */}
      {activeTab === 'users' && (
        <div>
          {/* Toolbar & Search */}
          <div className="card-clean mb-3 p-2.5 bg-white">
            <div className="row g-2 align-items-center justify-content-between">
              <div className="col-12 col-md-6">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <Search size={13} />
                  </span>
                  <input 
                    type="text" 
                    className="form-control form-control-clean border-start-0 ps-0"
                    style={{ fontSize: '0.75rem' }}
                    placeholder="Cari Username, Nama Pegawai, Role Akses..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12 col-md-auto text-end">
                <span className="text-muted small me-2" style={{ fontSize: '0.72rem' }}>
                  Total: <strong className="text-dark font-mono">{filteredUsers.length}</strong> Akun Terdaftar
                </span>
              </div>
            </div>
          </div>

          {/* List / Table Pengguna Aktif */}
          <div className="card-clean overflow-hidden bg-white">
            <div className="table-responsive">
              <table className="table-clean">
                <thead>
                  <tr>
                    <th>Pengguna / Akun</th>
                    <th>Nama Lengkap Pegawai</th>
                    <th>Hak Akses (Role)</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Aksi Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id || u.username}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div 
                            className="rounded-circle bg-primary bg-opacity-10 text-primary font-bold d-flex align-items-center justify-content-center shadow-2xs"
                            style={{ width: '32px', height: '32px', minWidth: '32px', fontSize: '0.75rem' }}
                          >
                            {(u.username || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-dark d-block font-mono" style={{ fontSize: '0.78rem' }}>
                              @{u.username}
                            </strong>
                            <small className="text-muted" style={{ fontSize: '0.68rem' }}>ID: #{u.id || '-'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.78rem' }}>
                          {u.employee_name || u.name || '-'}
                        </span>
                      </td>
                      <td>
                        <select 
                          className={`form-select form-select-sm font-semibold ${getRoleBadge(u.role)}`}
                          style={{ fontSize: '0.75rem', width: 'auto', minWidth: '150px' }}
                          value={u.role || 'User'}
                          onChange={(e) => onUpdateUserRole && onUpdateUserRole(u.id, e.target.value)}
                        >
                          <option value="Master">Master</option>
                          <option value="Direksi">Direksi</option>
                          <option value="General Manager">General Manager</option>
                          <option value="Manager">Manager</option>
                          <option value="Zone Manager">Zone Manager</option>
                          <option value="Supervisor">Supervisor</option>
                          <option value="Finance">Finance</option>
                          <option value="HRD">HRD</option>
                          <option value="User">User</option>
                        </select>
                      </td>
                      <td className="text-center">
                        <span className="badge-soft badge-soft-success font-semibold" style={{ fontSize: '0.68rem' }}>
                          ✓ Aktif
                        </span>
                      </td>
                      <td className="text-center">
                        <button 
                          className="btn btn-sm btn-light border py-0.5 px-2 text-xs font-semibold d-inline-flex align-items-center gap-1"
                          onClick={() => {
                            const newPass = prompt(`Masukkan password baru untuk pengguna @${u.username}:`);
                            if (newPass && onChangeUserPassword) {
                              onChangeUserPassword(u.id, newPass);
                            }
                          }}
                        >
                          <Key size={11} className="text-muted" />
                          <span>Ganti Password</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted small">
                        Tidak ada akun pengguna yang sesuai dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIKS HAK AKSES & OTORISASI FITUR */}
      {activeTab === 'roles' && (
        <div>
          <div className="card-clean p-3 bg-white mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
            <div>
              <h6 className="fw-bold text-dark mb-0.5" style={{ fontSize: '0.875rem' }}>
                Matriks Hak Akses Berdasarkan Peran Pengguna
              </h6>
              <p className="text-muted small mb-0" style={{ fontSize: '0.72rem' }}>
                Centang izin fitur pada setiap modul. Pengguna yang memiliki peran terkait akan otomatis mendapatkan akses.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button 
                type="button"
                className="btn btn-sm btn-light border px-2.5 py-1 text-xs fw-semibold text-muted"
                onClick={handleResetToDefault}
              >
                Reset Default
              </button>
              <button 
                className="btn btn-success btn-sm px-3 py-1 fw-bold d-flex align-items-center gap-1.5 shadow-2xs"
                style={{ fontSize: '0.75rem' }}
                onClick={handleSaveRoles}
              >
                <Check size={14} />
                <span>Simpan Perubahan Matriks</span>
              </button>
            </div>
          </div>

          {/* Grouped Permission Tables */}
          {PERMISSION_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="card-clean mb-3 bg-white overflow-hidden">
              {/* Group Header */}
              <div className="bg-light p-2.5 px-3 border-bottom d-flex align-items-center gap-2">
                {group.groupIcon}
                <strong className="text-dark" style={{ fontSize: '0.8rem' }}>{group.groupTitle}</strong>
              </div>

              <div className="table-responsive">
                <table className="table-clean mb-0">
                  <thead>
                    <tr>
                      <th style={{ minWidth: '240px' }}>Fungsi / Fitur Sistem</th>
                      {rolesList.map(r => (
                        <th key={r.id} className="text-center" style={{ minWidth: '95px' }}>
                          <span className="d-block fw-bold text-dark text-uppercase" style={{ fontSize: '0.72rem' }}>{r.name}</span>
                          <div className="d-flex justify-content-center gap-1 mt-0.5">
                            <button 
                              type="button" 
                              className="btn btn-2xs btn-light border py-0 px-1 text-2xs text-primary"
                              style={{ fontSize: '0.58rem' }}
                              onClick={() => handleToggleAllForRole(r.id, true)}
                              title="Pilih Semua Izin"
                            >
                              Semua
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-2xs btn-light border py-0 px-1 text-2xs text-muted"
                              style={{ fontSize: '0.58rem' }}
                              onClick={() => handleToggleAllForRole(r.id, false)}
                              title="Hapus Semua Izin"
                            >
                              Reset
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map(item => (
                      <tr key={item.key}>
                        <td>
                          <strong className="text-dark d-block" style={{ fontSize: '0.78rem' }}>
                            {item.title}
                          </strong>
                          <small className="text-muted" style={{ fontSize: '0.68rem' }}>
                            {item.desc}
                          </small>
                        </td>

                        {rolesList.map(r => {
                          const isChecked = (r.permissions || []).includes(item.key);
                          return (
                            <td key={`${r.id}-${item.key}`} className="text-center align-middle">
                              <input 
                                type="checkbox"
                                className="form-check-input cursor-pointer"
                                style={{ width: '16px', height: '16px' }}
                                checked={isChecked}
                                onChange={() => handleTogglePerm(r.id, item.key)}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Akun Pengguna Baru */}
      {showAddUserModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white py-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <UserPlus size={20} />
                  <h5 className="modal-title h6 fw-bold mb-0">Tambah Akun Pengguna Baru</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddUserModal(false)}></button>
              </div>

              <form onSubmit={handleCreateUserSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark mb-1">
                      Username <span className="text-danger">*</span>
                    </label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light text-muted">@</span>
                      <input 
                        type="text" 
                        className="form-control form-control-clean"
                        placeholder="contoh: angga.ops"
                        required
                        value={newUserForm.username}
                        onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value.toLowerCase().replace(/\s+/g, '.') })}
                      />
                    </div>
                    <div className="form-text text-2xs text-muted" style={{ fontSize: '0.68rem' }}>Digunakan untuk login ke sistem (tanpa spasi).</div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <label className="form-label small fw-bold text-dark mb-0">
                        Nama Lengkap Pegawai <span className="text-danger">*</span>
                      </label>
                      <button 
                        type="button" 
                        className="btn btn-link p-0 text-primary fw-semibold text-decoration-none"
                        style={{ fontSize: '0.68rem' }}
                        onClick={() => setIsManualName(prev => !prev)}
                      >
                        {isManualName ? '← Pilih dari Data Karyawan' : '+ Input Manual (Non-Karyawan)'}
                      </button>
                    </div>

                    {!isManualName ? (
                      <select 
                        className="form-select form-select-sm form-control-clean fw-semibold text-primary"
                        required
                        value={newUserForm.employee_name}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__manual__') {
                            setIsManualName(true);
                            return;
                          }
                          let nextUser = newUserForm.username;
                          if (!nextUser || nextUser.includes('.')) {
                            if (val) {
                              nextUser = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
                            }
                          }
                          setNewUserForm(prev => ({
                            ...prev,
                            employee_name: val,
                            username: nextUser
                          }));
                        }}
                      >
                        <option value="">-- Pilih dari Master Data Karyawan --</option>
                        {(employees || []).map(emp => (
                          <option key={emp.id || emp.nip || emp.name} value={emp.name}>
                            {emp.nip || emp.nik ? `[${emp.nip || emp.nik}] ` : ''}{emp.name} {emp.position ? `(${emp.position})` : ''} {emp.department ? `- ${emp.department}` : ''}
                          </option>
                        ))}
                        <option value="__manual__">+ Input Manual (Non-Karyawan)...</option>
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        className="form-control form-control-sm form-control-clean"
                        placeholder="contoh: Angga Pratama"
                        required
                        value={newUserForm.employee_name}
                        onChange={(e) => setNewUserForm({ ...newUserForm, employee_name: e.target.value })}
                      />
                    )}
                    <div className="form-text text-2xs text-muted" style={{ fontSize: '0.68rem' }}>
                      Akun yang terhubung ke data karyawan dapat melihat data profil kepegawaiannya di portal.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark mb-1">
                      Hak Akses (Role) <span className="text-danger">*</span>
                    </label>
                    <select 
                      className="form-select form-select-sm form-control-clean font-semibold"
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    >
                      <option value="Supervisor">Supervisor (Pengajuan Comcase)</option>
                      <option value="Zone Manager">Zone Manager (Review &amp; Dokumen External)</option>
                      <option value="Manager">Manager (Persetujuan Sah)</option>
                      <option value="General Manager">General Manager (Checker 1)</option>
                      <option value="Finance">Finance (Pencairan &amp; Kas)</option>
                      <option value="HRD">HRD (Personalia &amp; Armada)</option>
                      <option value="Direksi">Direksi / Owner (Approval Final)</option>
                      <option value="User">User (Validasi BBM Lapangan)</option>
                      <option value="Master">Master (Super Admin)</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-dark mb-1">
                      Password Awal <span className="text-danger">*</span>
                    </label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light text-muted"><Key size={13} /></span>
                      <input 
                        type="text" 
                        className="form-control form-control-clean"
                        placeholder="Password akun"
                        required
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light px-4 py-3 border-top d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-light border px-3"
                    onClick={() => setShowAddUserModal(false)}
                    disabled={savingUser}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-sm btn-primary px-4 fw-bold d-flex align-items-center gap-1.5 shadow-2xs"
                    disabled={savingUser}
                  >
                    {savingUser ? 'Menyimpan...' : (
                      <>
                        <Check size={14} />
                        <span>Simpan Akun ke Database</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
