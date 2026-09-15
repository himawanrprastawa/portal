import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  Eye, 
  FileText, 
  Download, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Coffee, 
  UserX,
  Calendar
} from 'lucide-react';

export default function Employees({ 
  employees, 
  onSaveEmployee, 
  onDeleteEmployee, 
  onOpenAddEmployee, 
  onOpenEditEmployee 
}) {
  const { hasAccess, formatCurrency } = useAuth();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All'); // 'All', 'Field Worker', 'Back Office'
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Aktif', 'Cuti', 'Resign', 'H30'
  
  // Detail Modal State
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Document Viewer Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  // Helper to calculate days remaining
  const calculateDaysRemaining = (emp) => {
    if (typeof emp.pkwt_days_remaining === 'number') {
      return emp.pkwt_days_remaining;
    }
    const endDateStr = emp.pkwtEndDate || emp.pkwt_end_date;
    if (!endDateStr) return 365;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);
    const diff = end - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Helper to check dynamic active status (auto-active if leave ended)
  const getDynamicStatus = (emp) => {
    if (emp.status === 'Cuti') {
      const leaveEnd = emp.leaveEndDate || emp.leave_end_date;
      if (leaveEnd) {
        const todayStr = new Date().toISOString().split('T')[0];
        if (todayStr > leaveEnd) {
          return 'Aktif'; // Otomatis aktif kembali ketika masa cuti habis
        }
      }
    }
    return emp.status || 'Aktif';
  };

  // Metric Counts
  const totalCount = (employees || []).length;
  const activeCount = (employees || []).filter(e => getDynamicStatus(e) === 'Aktif').length;
  const cutiCount = (employees || []).filter(e => getDynamicStatus(e) === 'Cuti').length;
  const resignCount = (employees || []).filter(e => getDynamicStatus(e) === 'Resign').length;
  const expiringSoonCount = (employees || []).filter(e => {
    const days = calculateDaysRemaining(e);
    return days <= 30 && days >= 0;
  }).length;
  const fieldWorkerCount = (employees || []).filter(e => (e.employeeType || e.employee_type || 'Field Worker') === 'Field Worker').length;
  const backOfficeCount = (employees || []).filter(e => (e.employeeType || e.employee_type) === 'Back Office').length;

  const filtered = (employees || []).filter(emp => {
    const type = emp.employeeType || emp.employee_type || 'Field Worker';
    if (filterType !== 'All' && type !== filterType) return false;
    
    const dynStatus = getDynamicStatus(emp);
    const days = calculateDaysRemaining(emp);

    if (filterStatus === 'Aktif' && dynStatus !== 'Aktif') return false;
    if (filterStatus === 'Cuti' && dynStatus !== 'Cuti') return false;
    if (filterStatus === 'Resign' && dynStatus !== 'Resign') return false;
    if (filterStatus === 'H30' && (days > 30 || days < 0)) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (emp.name && emp.name.toLowerCase().includes(q)) ||
           (emp.nik && emp.nik.toLowerCase().includes(q)) ||
           (emp.nip && emp.nip.toLowerCase().includes(q)) ||
           (emp.position && emp.position.toLowerCase().includes(q)) ||
           (emp.department && emp.department.toLowerCase().includes(q));
  });

  const handleViewDetail = (emp) => {
    setSelectedEmp(emp);
    setShowDetailModal(true);
  };

  const handleOpenDocViewer = (title, urlOrFileName) => {
    if (!urlOrFileName) return;
    setPreviewDoc({
      title,
      url: urlOrFileName,
      isImage: typeof urlOrFileName === 'string' && (urlOrFileName.startsWith('data:image') || urlOrFileName.match(/\.(jpg|jpeg|png|webp|gif)$/i))
    });
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Header with Tambah Karyawan Baru Button */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>Data Karyawan</h5>
        </div>
        {hasAccess('HRD', 'create') && (
          <button 
            className="btn btn-primary btn-sm fw-semibold d-flex align-items-center gap-1.5 shadow-2xs" 
            style={{ fontSize: '0.75rem' }} 
            onClick={onOpenAddEmployee}
          >
            <Plus size={14} />
            <span>Tambah Karyawan Baru</span>
          </button>
        )}
      </div>

      {/* 5 KPI Metric Dashboard Cards Row (Clickable to Filter) */}
      <div className="row g-2.5 mb-3">
        {/* 1. Total Karyawan */}
        <div className="col-6 col-md-4 col-lg">
          <div 
            className={`card-stat cursor-pointer ${filterStatus === 'All' ? 'border-primary shadow-xs' : ''}`}
            style={{ cursor: 'pointer', backgroundColor: filterStatus === 'All' ? 'rgba(37, 99, 235, 0.04)' : undefined }}
            onClick={() => setFilterStatus('All')}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted fw-bold" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>Total Karyawan</span>
              <div className="rounded-2 bg-primary bg-opacity-10 text-primary p-1">
                <Users size={14} />
              </div>
            </div>
            <h5 className="fw-black text-dark mb-0 font-mono" style={{ fontSize: '1.25rem' }}>{totalCount}</h5>
            <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Semua Staff BSM</small>
          </div>
        </div>

        {/* 2. Karyawan Aktif */}
        <div className="col-6 col-md-4 col-lg">
          <div 
            className={`card-stat cursor-pointer ${filterStatus === 'Aktif' ? 'border-success shadow-xs' : ''}`}
            style={{ cursor: 'pointer', backgroundColor: filterStatus === 'Aktif' ? 'rgba(34, 197, 94, 0.05)' : undefined }}
            onClick={() => setFilterStatus('Aktif')}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-success fw-bold" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>Karyawan Aktif</span>
              <div className="rounded-2 bg-success bg-opacity-15 text-success p-1">
                <UserCheck size={14} />
              </div>
            </div>
            <h5 className="fw-black text-success mb-0 font-mono" style={{ fontSize: '1.25rem' }}>{activeCount}</h5>
            <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Siap Bertugas</small>
          </div>
        </div>

        {/* 3. Karyawan Cuti */}
        <div className="col-6 col-md-4 col-lg">
          <div 
            className={`card-stat cursor-pointer ${filterStatus === 'Cuti' ? 'border-warning shadow-xs' : ''}`}
            style={{ cursor: 'pointer', backgroundColor: filterStatus === 'Cuti' ? 'rgba(234, 179, 8, 0.06)' : undefined }}
            onClick={() => setFilterStatus('Cuti')}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-warning-emphasis fw-bold" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>Karyawan Cuti</span>
              <div className="rounded-2 bg-warning bg-opacity-15 text-warning-emphasis p-1">
                <Coffee size={14} />
              </div>
            </div>
            <h5 className="fw-black text-warning-emphasis mb-0 font-mono" style={{ fontSize: '1.25rem' }}>{cutiCount}</h5>
            <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Otomatis Aktif saat Habis</small>
          </div>
        </div>

        {/* 4. Karyawan Resign */}
        <div className="col-6 col-md-4 col-lg">
          <div 
            className={`card-stat cursor-pointer ${filterStatus === 'Resign' ? 'border-danger shadow-xs' : ''}`}
            style={{ cursor: 'pointer', backgroundColor: filterStatus === 'Resign' ? 'rgba(239, 68, 68, 0.05)' : undefined }}
            onClick={() => setFilterStatus('Resign')}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-danger fw-bold" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>Karyawan Resign</span>
              <div className="rounded-2 bg-danger bg-opacity-10 text-danger p-1">
                <UserX size={14} />
              </div>
            </div>
            <h5 className="fw-black text-danger mb-0 font-mono" style={{ fontSize: '1.25rem' }}>{resignCount}</h5>
            <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Non-Aktif</small>
          </div>
        </div>

        {/* 5. Mau Habis Kontrak (H-30) */}
        <div className="col-12 col-md-4 col-lg">
          <div 
            className={`card-stat cursor-pointer ${filterStatus === 'H30' ? 'border-warning shadow-xs' : ''}`}
            style={{ cursor: 'pointer', backgroundColor: filterStatus === 'H30' ? 'rgba(234, 179, 8, 0.08)' : undefined }}
            onClick={() => setFilterStatus('H30')}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-warning-emphasis fw-bold" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>Habis Kontrak (H-30)</span>
              <div className="rounded-2 bg-warning text-dark p-1">
                <Clock size={14} />
              </div>
            </div>
            <h5 className="fw-black text-warning-emphasis mb-0 font-mono" style={{ fontSize: '1.25rem' }}>{expiringSoonCount}</h5>
            <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Perlu Peninjauan</small>
          </div>
        </div>
      </div>

      {/* Tab Filter Tipe Karyawan & Pencarian */}
      <div className="card-clean mb-3 p-2.5 bg-white">
        <div className="row g-2 align-items-center justify-content-between">
          {/* Segmented Filter: Semua vs Field Worker vs Back Office */}
          <div className="col-12 col-md-auto">
            <div className="d-flex align-items-center gap-1 p-1 bg-light rounded-2 border">
              <button 
                type="button"
                className={`btn btn-sm py-1 px-3 fw-bold rounded-2 border-0 transition-all ${
                  filterType === 'All' 
                    ? 'btn-primary shadow-2xs text-white' 
                    : 'text-muted bg-transparent'
                }`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => setFilterType('All')}
              >
                Semua Karyawan ({totalCount})
              </button>
              <button 
                type="button"
                className={`btn btn-sm py-1 px-3 fw-bold rounded-2 border-0 transition-all ${
                  filterType === 'Field Worker' 
                    ? 'btn-primary shadow-2xs text-white' 
                    : 'text-muted bg-transparent'
                }`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => setFilterType('Field Worker')}
              >
                Field Worker ({fieldWorkerCount})
              </button>
              <button 
                type="button"
                className={`btn btn-sm py-1 px-3 fw-bold rounded-2 border-0 transition-all ${
                  filterType === 'Back Office' 
                    ? 'btn-primary shadow-2xs text-white' 
                    : 'text-muted bg-transparent'
                }`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => setFilterType('Back Office')}
              >
                Back Office ({backOfficeCount})
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                className="form-control form-control-clean border-start-0 ps-0"
                style={{ fontSize: '0.78rem' }}
                placeholder="Pencarian Karyawan"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  className="btn btn-light border-start-0 text-muted" 
                  type="button" 
                  onClick={() => setSearch('')}
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* List / Table Karyawan */}
      <div className="card-clean overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table-clean">
            <thead>
              <tr>
                <th>ID &amp; Karyawan</th>
                <th>Jabatan &amp; Divisi</th>
                <th className="text-center">Tipe Kerja</th>
                <th>Kontrak PKWT &amp; Durasi</th>
                <th className="text-center">Status Kepegawaian</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => {
                const photoSrc = emp.photo_preview || emp.photo_url || (emp.docPhoto && emp.docPhoto.startsWith('data:') ? emp.docPhoto : null);
                const days = calculateDaysRemaining(emp);
                const dur = emp.pkwtDurationMonths || emp.pkwt_duration_months || 12;
                const end = emp.pkwtEndDate || emp.pkwt_end_date || '-';
                const dynStatus = getDynamicStatus(emp);
                const leaveEnd = emp.leaveEndDate || emp.leave_end_date;

                return (
                  <tr key={emp.id || emp.nik || emp.nip} className={days <= 30 && days >= 0 ? 'bg-warning bg-opacity-10' : ''}>
                    <td>
                      <div className="d-flex align-items-center gap-2.5">
                        {/* Circular Photo / Avatar */}
                        {photoSrc ? (
                          <img 
                            src={photoSrc} 
                            alt={emp.name} 
                            className="rounded-circle border object-fit-cover shadow-2xs"
                            style={{ width: '34px', height: '34px', minWidth: '34px' }}
                          />
                        ) : (
                          <div 
                            className="rounded-circle bg-primary bg-opacity-10 text-primary font-bold d-flex align-items-center justify-center shadow-2xs"
                            style={{ width: '34px', height: '34px', minWidth: '34px', fontSize: '0.78rem' }}
                          >
                            {(emp.name || 'E')[0].toUpperCase()}
                          </div>
                        )}

                        <div>
                          <strong className="text-dark d-block" style={{ fontSize: '0.8rem' }}>{emp.name}</strong>
                          <span className="badge-soft badge-soft-primary font-mono fw-bold" style={{ fontSize: '0.68rem' }}>
                            {emp.nip || emp.nik || 'BST-0001'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.78rem' }}>{emp.position || '-'}</span>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>{emp.department || (emp.employeeType === 'Back Office' ? 'HRD' : 'Member')}</small>
                    </td>
                    <td className="text-center">
                      <span className={`badge-soft ${emp.employeeType === 'Field Worker' ? 'badge-soft-warning' : 'badge-soft-primary'}`} style={{ fontSize: '0.68rem' }}>
                        {emp.employeeType || 'Field Worker'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1.5" style={{ fontSize: '0.72rem' }}>
                        <span className="badge-soft badge-soft-slate font-mono">{dur} Bulan</span>
                        <span className="text-muted font-mono">s/d {end}</span>
                      </div>
                      {days <= 30 && days >= 0 && (
                        <small className="text-warning-emphasis font-bold d-block" style={{ fontSize: '0.65rem' }}>
                          ⚠️ H-{days} Hari Jatuh Tempo
                        </small>
                      )}
                    </td>
                    <td className="text-center">
                      {dynStatus === 'Aktif' && (
                        <span className="badge-soft badge-soft-success font-semibold" style={{ fontSize: '0.68rem' }}>
                          ✓ Aktif
                        </span>
                      )}
                      {dynStatus === 'Cuti' && (
                        <div>
                          <span className="badge-soft badge-soft-warning font-semibold d-inline-block" style={{ fontSize: '0.68rem' }}>
                            ☕ Cuti
                          </span>
                          {leaveEnd && (
                            <small className="text-muted d-block font-mono" style={{ fontSize: '0.62rem' }}>
                              s/d {leaveEnd}
                            </small>
                          )}
                        </div>
                      )}
                      {dynStatus === 'Resign' && (
                        <span className="badge-soft badge-soft-danger font-semibold" style={{ fontSize: '0.68rem' }}>
                          ✕ Resign
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <button 
                          className="btn btn-sm btn-light border py-0.5 px-2 text-xs font-semibold"
                          onClick={() => handleViewDetail(emp)}
                        >
                          Detail
                        </button>
                        {hasAccess('HRD', 'edit') && (
                          <button 
                            className="btn btn-sm btn-light border py-0.5 px-2 text-xs font-semibold text-primary"
                            onClick={() => onOpenEditEmployee(emp)}
                          >
                            <Edit3 size={11} className="me-0.5" />
                            <span>Edit</span>
                          </button>
                        )}
                        {hasAccess('HRD', 'delete') && (
                          <button 
                            className="btn btn-outline-danger btn-sm py-0.5 px-1.5 text-xs"
                            onClick={() => onDeleteEmployee(emp.id || emp.nip || emp.nik)}
                            title="Hapus Karyawan"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted small">
                    Tidak ada data karyawan yang sesuai filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Profile Modal */}
      {showDetailModal && selectedEmp && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              {/* Header with Circular Avatar & Name */}
              <div className="modal-header bg-dark text-white py-3 px-3 px-md-4">
                <div className="d-flex align-items-center gap-3">
                  {selectedEmp.photo_preview || selectedEmp.photo_url || (selectedEmp.docPhoto && selectedEmp.docPhoto.startsWith('data:')) ? (
                    <img 
                      src={selectedEmp.photo_preview || selectedEmp.photo_url || selectedEmp.docPhoto} 
                      alt={selectedEmp.name}
                      className="rounded-circle border border-2 border-white object-fit-cover shadow-xs"
                      style={{ width: '52px', height: '52px', minWidth: '52px' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-primary text-white font-bold d-flex align-items-center justify-center border border-2 border-white shadow-xs"
                      style={{ width: '52px', height: '52px', minWidth: '52px', fontSize: '1.2rem' }}
                    >
                      {(selectedEmp.name || 'E')[0].toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h6 className="modal-title fw-bold mb-0 text-white" style={{ fontSize: '0.95rem' }}>
                      {selectedEmp.name}
                    </h6>
                    <small className="text-secondary" style={{ fontSize: '0.72rem' }}>
                      ID Karyawan: <strong className="text-white font-mono">{selectedEmp.nip || selectedEmp.nik || 'BST-0001'}</strong> &bull; {selectedEmp.position || 'Staff'} ({selectedEmp.department || (selectedEmp.employeeType === 'Back Office' ? 'HRD' : 'Member')})
                    </small>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
              </div>

              <div className="modal-body p-3 p-md-4 small">
                <div className="row g-3">
                  {/* 1. Biodata & Kependudukan */}
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-2 h-100">
                      <span className="text-primary fw-bold d-block mb-2 pb-1 border-bottom" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        1. Biodata &amp; Kependudukan
                      </span>
                      <div className="d-flex justify-content-between mb-1.5"><span className="text-muted">ID Karyawan:</span> <strong className="font-mono text-primary">{selectedEmp.nip || selectedEmp.nik || '-'}</strong></div>
                      <div className="d-flex justify-content-between mb-1.5"><span className="text-muted">Nama Lengkap:</span> <strong className="text-dark">{selectedEmp.name}</strong></div>
                      <div className="d-flex justify-content-between mb-1.5"><span className="text-muted">Tempat/Tgl Lahir:</span> <span className="text-dark">{selectedEmp.birthPlace || '-'}, {selectedEmp.birthDate || '-'}</span></div>
                      <div className="d-flex justify-content-between mb-1.5"><span className="text-muted">Nomor KTP (NIK):</span> <span className="font-mono text-dark">{selectedEmp.ktpNik || '-'}</span></div>
                      <div className="d-flex justify-content-between"><span className="text-muted">Alamat Domisili:</span> <span className="text-dark text-end">{selectedEmp.address || '-'}</span></div>
                    </div>
                  </div>

                  {/* 2. Kepegawaian, Finansial, Kontrak PKWT & Status */}
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-2 h-100">
                      <span className="text-primary fw-bold d-block mb-2 pb-1 border-bottom" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        2. Kepegawaian &amp; Kontrak PKWT
                      </span>
                      <div className="d-flex justify-content-between mb-1.5"><span className="text-muted">Jabatan / Divisi:</span> <strong className="text-dark">{selectedEmp.position} ({selectedEmp.department || (selectedEmp.employeeType === 'Back Office' ? 'HRD' : 'Member')})</strong></div>
                      <div className="d-flex justify-content-between mb-1.5"><span className="text-muted">Tipe Karyawan:</span> <span className="badge-soft badge-soft-primary">{selectedEmp.employeeType || 'Field Worker'}</span></div>
                      
                      {/* Status Kepegawaian */}
                      <div className="d-flex justify-content-between mb-1.5">
                        <span className="text-muted">Status Kepegawaian:</span>
                        {getDynamicStatus(selectedEmp) === 'Aktif' ? (
                          <span className="badge-soft badge-soft-success">✓ Status Aktif</span>
                        ) : getDynamicStatus(selectedEmp) === 'Cuti' ? (
                          <span className="badge-soft badge-soft-warning">☕ Cuti (s/d {selectedEmp.leaveEndDate || selectedEmp.leave_end_date || '-'})</span>
                        ) : (
                          <span className="badge-soft badge-soft-danger">✕ Resign</span>
                        )}
                      </div>

                      {/* If Cuti */}
                      {getDynamicStatus(selectedEmp) === 'Cuti' && (
                        <div className="p-2 bg-warning bg-opacity-10 rounded mb-2 border border-warning" style={{ fontSize: '0.7rem' }}>
                          <span className="text-dark fw-bold d-block">Masa Waktu Cuti:</span>
                          <span className="font-mono text-dark">{selectedEmp.leaveStartDate || selectedEmp.leave_start_date || '-'} s/d {selectedEmp.leaveEndDate || selectedEmp.leave_end_date || '-'}</span>
                          {selectedEmp.leaveNotes && <p className="text-muted mb-0 mt-0.5">Catatan: {selectedEmp.leaveNotes}</p>}
                        </div>
                      )}

                      <div className="d-flex justify-content-between mb-1.5"><span className="text-muted">Durasi Kontrak:</span> <strong className="text-dark font-mono">{selectedEmp.pkwtDurationMonths || selectedEmp.pkwt_duration_months || 12} Bulan</strong></div>
                      <div className="d-flex justify-content-between mb-1.5"><span className="text-muted">Periode PKWT:</span> <span className="font-mono text-dark">{selectedEmp.pkwtDate || '-'} s/d {selectedEmp.pkwtEndDate || selectedEmp.pkwt_end_date || '-'}</span></div>
                      
                      <div className="d-flex justify-content-between mb-1.5"><span className="text-muted">Gaji Pokok:</span> <strong className="font-mono text-dark">{selectedEmp.baseSalary ? formatCurrency(selectedEmp.baseSalary) : '-'}</strong></div>
                      <div className="d-flex justify-content-between"><span className="text-muted">Rekening Bank:</span> <span className="font-mono text-dark">{selectedEmp.bankName || 'BCA'} - {selectedEmp.bankAccount || '-'}</span></div>
                    </div>
                  </div>

                  {/* 3. Jaminan Sosial & Kontak Darurat 3 Kolom */}
                  <div className="col-12">
                    <div className="p-3 bg-light rounded-2">
                      <span className="text-primary fw-bold d-block mb-2 pb-1 border-bottom" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        3. Jaminan Sosial &amp; Kontak Darurat (3 Kolom)
                      </span>
                      <div className="row g-2">
                        <div className="col-12 col-md-6">
                          <div className="d-flex justify-content-between mb-1"><span className="text-muted">BPJS Ketenagakerjaan:</span> <span className="font-mono text-dark">{selectedEmp.bpjsTk || '-'}</span></div>
                          <div className="d-flex justify-content-between"><span className="text-muted">BPJS Kesehatan:</span> <span className="font-mono text-dark">{selectedEmp.bpjsKs || '-'}</span></div>
                        </div>
                        <div className="col-12 col-md-6 border-start-md ps-md-3">
                          <div className="d-flex justify-content-between mb-1"><span className="text-muted">Kontak Istri/Pasangan:</span> <span className="font-mono text-dark">{selectedEmp.emergencyContactWife || '-'}</span></div>
                          <div className="d-flex justify-content-between mb-1"><span className="text-muted">Kontak Ayah:</span> <span className="font-mono text-dark">{selectedEmp.emergencyContactFather || '-'}</span></div>
                          <div className="d-flex justify-content-between"><span className="text-muted">Kontak Ibu:</span> <span className="font-mono text-dark">{selectedEmp.emergencyContactMother || '-'}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Berkas & Dokumen Terlampir (7 Dokumen) */}
                  <div className="col-12">
                    <div className="p-3 bg-light rounded-2">
                      <span className="text-primary fw-bold d-block mb-2 pb-1 border-bottom" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        4. Berkas &amp; Dokumen Terlampir (7 Dokumen Wajib)
                      </span>
                      <div className="row g-2">
                        {[
                          { key: 'docPhoto', label: '1. Pas Foto Diri', isImg: true, fallback: selectedEmp.photo_preview || selectedEmp.photo_url },
                          { key: 'docKtp', label: '2. Foto KTP', isImg: true, fallback: selectedEmp.docKtp_url },
                          { key: 'docKk', label: '3. Foto Kartu Keluarga (KK)', isImg: true, fallback: selectedEmp.docKk_url },
                          { key: 'docCv', label: '4. CV Karyawan', isImg: false, fallback: selectedEmp.docCv_url },
                          { key: 'docTkpk1', label: '5. Sertifikat TKPK 1', isImg: false, fallback: selectedEmp.docTkpk1_url },
                          { key: 'docFirstAid', label: '6. Sertifikat First Aid (P3K)', isImg: false, fallback: selectedEmp.docFirstAid_url },
                          { key: 'docBasicElectric', label: '7. Sertifikat Basic Electric', isImg: false, fallback: selectedEmp.docBasicElectric_url }
                        ].map(doc => {
                          const hasFile = selectedEmp[doc.key] || doc.fallback;
                          const fileValue = doc.fallback || selectedEmp[doc.key];

                          return (
                            <div key={doc.key} className="col-12 col-sm-6 col-md-4">
                              <div className="p-2 bg-white rounded border d-flex align-items-center justify-content-between" style={{ fontSize: '0.72rem' }}>
                                <div className="text-truncate pe-1">
                                  <strong className="d-block text-dark text-truncate">{doc.label}</strong>
                                  <small className="text-muted d-block text-truncate">
                                    {hasFile ? (typeof hasFile === 'string' && hasFile.startsWith('data:') ? 'Tersedia (Siap View)' : hasFile) : 'Belum Ada Berkas'}
                                  </small>
                                </div>
                                {hasFile ? (
                                  <button 
                                    type="button" 
                                    className="btn btn-sm btn-primary py-0.5 px-2 text-xs d-flex align-items-center gap-1 font-semibold"
                                    onClick={() => handleOpenDocViewer(doc.label, fileValue)}
                                  >
                                    <Eye size={12} />
                                    <span>Lihat</span>
                                  </button>
                                ) : (
                                  <span className="badge-soft badge-soft-slate text-xs">-</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light py-2 px-3 justify-content-between">
                <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowDetailModal(false)}>Tutup</button>
                {hasAccess('HRD', 'edit') && (
                  <button type="button" className="btn btn-sm btn-primary px-3 fw-semibold" onClick={() => { setShowDetailModal(false); onOpenEditEmployee(selectedEmp); }}>
                    <Edit3 size={13} className="me-1" />
                    <span>Edit Profil Karyawan</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Document Viewer / Lightbox Modal */}
      {previewDoc && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden bg-dark text-white">
              <div className="modal-header border-secondary py-2 px-3">
                <h6 className="modal-title fw-bold mb-0 text-white" style={{ fontSize: '0.875rem' }}>
                  Pratinjau Dokumen: {previewDoc.title}
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewDoc(null)}></button>
              </div>
              <div className="modal-body p-3 text-center bg-black d-flex align-items-center justify-content-center" style={{ minHeight: '350px', maxHeight: '75vh' }}>
                {previewDoc.isImage || (typeof previewDoc.url === 'string' && previewDoc.url.startsWith('data:image')) ? (
                  <img 
                    src={previewDoc.url} 
                    alt={previewDoc.title} 
                    className="img-fluid rounded" 
                    style={{ maxHeight: '70vh', objectFit: 'contain' }} 
                  />
                ) : (
                  <div className="p-4 text-center text-light">
                    <FileText size={48} className="text-primary mb-2" />
                    <h6 className="fw-bold mb-1">{previewDoc.title}</h6>
                    <p className="text-secondary small mb-3">Dokumen format PDF / Berkas Digital</p>
                    <a 
                      href={previewDoc.url} 
                      download={previewDoc.title} 
                      className="btn btn-sm btn-primary px-3 fw-semibold"
                    >
                      <Download size={13} className="me-1" />
                      <span>Download / Buka Berkas</span>
                    </a>
                  </div>
                )}
              </div>
              <div className="modal-footer border-secondary py-1.5 px-3">
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setPreviewDoc(null)}>Tutup Pratinjau</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
