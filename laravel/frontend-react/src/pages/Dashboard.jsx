import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Send, 
  Inbox, 
  CreditCard, 
  Truck, 
  FileCheck, 
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Users,
  Calendar,
  Layers,
  Plus,
  ArrowRight,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function Dashboard({ 
  comcases = [], 
  zoneRequests = [], 
  vehicles = [], 
  employees = [],
  expenses = [], 
  setActiveTab,
  onViewComcaseDetail,
  onViewZoneDetail
}) {
  const { formatCurrency, currentUser, hasAccess, showToast } = useAuth();
  
  const isMaster = (currentUser?.role || '').toLowerCase().includes('master') || (currentUser?.role || '').toLowerCase().includes('admin');
  const canAccessComcase = hasAccess('Comcase', 'view') || hasAccess('Manager') || hasAccess('ZoneManager') || isMaster;
  const canCreateComcase = hasAccess('Comcase', 'create') || isMaster;
  const canAccessZone = hasAccess('ZoneManager', 'view') || hasAccess('Manager') || hasAccess('Finance') || isMaster;
  const canCreateZone = hasAccess('ZoneManager', 'create') || isMaster;
  const canAccessFinance = hasAccess('Finance', 'view') || isMaster;
  const canCreateFinance = hasAccess('Finance', 'create') || isMaster;
  const canAccessVehicle = hasAccess('Vehicle', 'view') || isMaster;
  const canCreateVehicle = hasAccess('Vehicle', 'create') || isMaster;
  const canAssignVehicle = hasAccess('Vehicle', 'assign') || isMaster;
  const canAccessHRD = hasAccess('HRD', 'view') || isMaster;
  const canCreateHRD = hasAccess('HRD', 'create') || isMaster;
  const canAccessBBM = hasAccess('User', 'bbm') || hasAccess('Vehicle') || isMaster;

  const [activeTableTab, setActiveTableTab] = useState(() => {
    if (canAccessComcase) return 'comcase';
    if (canAccessZone) return 'zone';
    if (canAccessHRD) return 'employee';
    if (canAccessVehicle) return 'vehicle';
    return 'comcase';
  });

  // Statistics calculation
  const totalComcaseCount = (comcases || []).length;
  const totalComcaseAmount = (comcases || []).reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  
  const pendingZoneReview = (comcases || []).filter(c => (c.status || '').toLowerCase().includes('review zone')).length;
  const pendingManagerApproval = (comcases || []).filter(c => (c.status || '').toLowerCase().includes('approval manager')).length;
  const pendingFinancePayment = (comcases || []).filter(c => (c.status || '').toLowerCase() === 'disetujui manager').length;
  const paidComcase = (comcases || []).filter(c => (c.status || '').toLowerCase() === 'sudah dibayar').length;

  const totalZoneRequests = (zoneRequests || []).length;
  const pendingZoneTtdManager = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('ttd manager') || r.status === 'Pending').length;
  const pendingZoneTtdGm = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('ttd general manager') || (r.status || '').toLowerCase().includes('ttd gm')).length;
  const pendingZoneTtdOwner = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('ttd owner')).length;
  const pendingZoneFinance = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('disetujui owner') || (r.status || '').toLowerCase().includes('menunggu pencairan')).length;
  const completedZone = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('dicairkan') || (r.status || '').toLowerCase().includes('selesai')).length;

  const totalExpenseAmount = (expenses || []).reduce((sum, x) => sum + (parseFloat(x.amount || x.nominal) || 0), 0);
  const availableVehicles = (vehicles || []).filter(v => (v.status || '').toLowerCase() === 'tersedia').length;
  const activeEmployees = (employees || []).filter(e => (e.status || 'aktif').toLowerCase() === 'aktif').length;

  // Date formatted
  const todayDateStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Header with Greeting, Date & System Badge */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark mb-0.5" style={{ letterSpacing: '-0.02em' }}>
            Dashboard Ringkasan
          </h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
            Monitoring operasional Comcase lapangan, permohonan zona external, kas keuangan, dan kesiapan armada.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center gap-1.5 px-2.5 py-1 bg-white border rounded-2 shadow-2xs">
            <Calendar size={13} className="text-muted" />
            <span className="text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>{todayDateStr}</span>
          </div>
          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-2 fw-semibold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
            <span className="rounded-circle bg-success" style={{ width: 6, height: 6 }}></span>
            Sistem Aktif
          </span>
        </div>
      </div>

      {/* KPI Cards Grid (Modern, Elevated & Interactive) */}
      <div className="row g-2.5 mb-3">
        {/* 1. Total Comcase */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div 
            className="card-clean p-3 bg-white h-100 transition-all cursor-pointer hover-shadow"
            onClick={() => {
              if (canAccessComcase) {
                setActiveTab && setActiveTab('comcase-list');
              } else {
                showToast('Role Anda tidak memiliki izin akses ke modul Comcase.', 'error');
              }
            }}
            title={canAccessComcase ? "Buka modul Comcase" : "Akses terbatas"}
          >
            <div className="d-flex justify-content-between align-items-center mb-1.5">
              <span className="text-muted fw-bold" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Comcase
              </span>
              <div className="rounded-2 bg-primary bg-opacity-10 text-primary p-1.5">
                <FileText size={16} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <h4 className="fw-black text-dark mb-0 font-mono" style={{ fontSize: '1.45rem' }}>{totalComcaseCount}</h4>
              <span className="font-mono text-primary fw-bold" style={{ fontSize: '0.8rem' }}>{formatCurrency(totalComcaseAmount)}</span>
            </div>
            <div className="d-flex align-items-center justify-content-between pt-1 border-top" style={{ fontSize: '0.68rem' }}>
              <span className="text-muted">
                {paidComcase + pendingFinancePayment} Disetujui
              </span>
              <span className="text-primary fw-semibold d-inline-flex align-items-center gap-0.5">
                Detail <ChevronRight size={12} />
              </span>
            </div>
          </div>
        </div>

        {/* 2. Pending Approval Manager */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div 
            className="card-clean p-3 bg-white h-100 transition-all cursor-pointer hover-shadow"
            onClick={() => {
              if (hasAccess('Manager') || isMaster) {
                setActiveTab && setActiveTab('manager-comcase-all');
              } else if (hasAccess('ZoneManager') || isMaster) {
                setActiveTab && setActiveTab('zone-review');
              } else {
                showToast('Hanya role Manager atau Zone Manager yang dapat memeriksa approval.', 'error');
              }
            }}
            title="Klik untuk melihat berkas persetujuan"
          >
            <div className="d-flex justify-content-between align-items-center mb-1.5">
              <span className="text-muted fw-bold" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Approval Manager
              </span>
              <div className="rounded-2 bg-warning bg-opacity-15 text-warning-emphasis p-1.5">
                <Clock size={16} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <h4 className="fw-black text-dark mb-0 font-mono" style={{ fontSize: '1.45rem' }}>{pendingManagerApproval}</h4>
              <span className="badge-soft badge-soft-warning fw-semibold">Menunggu</span>
            </div>
            <div className="d-flex align-items-center justify-content-between pt-1 border-top" style={{ fontSize: '0.68rem' }}>
              <span className="text-muted">{pendingZoneReview} di Zone Mgr</span>
              <span className="text-warning-emphasis fw-semibold d-inline-flex align-items-center gap-0.5">
                Periksa <ChevronRight size={12} />
              </span>
            </div>
          </div>
        </div>

        {/* 3. Permohonan External PDF */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div 
            className="card-clean p-3 bg-white h-100 transition-all cursor-pointer hover-shadow"
            onClick={() => {
              if (canAccessZone) {
                setActiveTab && setActiveTab('zone-requests');
              } else {
                showToast('Role Anda tidak memiliki izin akses ke Permohonan External.', 'error');
              }
            }}
            title={canAccessZone ? "Buka modul Permohonan External" : "Akses terbatas"}
          >
            <div className="d-flex justify-content-between align-items-center mb-1.5">
              <span className="text-muted fw-bold" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Permohonan External (PDF)
              </span>
              <div className="rounded-2 bg-info bg-opacity-15 text-info p-1.5">
                <FileCheck size={16} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <h4 className="fw-black text-dark mb-0 font-mono" style={{ fontSize: '1.45rem' }}>{totalZoneRequests}</h4>
              <span className="badge-soft badge-soft-primary fw-semibold">3-Tier TTD</span>
            </div>
            <div className="d-flex align-items-center justify-content-between pt-1 border-top" style={{ fontSize: '0.68rem' }}>
              <span className="text-muted">
                {pendingZoneTtdManager + pendingZoneTtdGm + pendingZoneTtdOwner} Berkas TTD
              </span>
              <span className="text-primary fw-semibold d-inline-flex align-items-center gap-0.5">
                Buka <ChevronRight size={12} />
              </span>
            </div>
          </div>
        </div>

        {/* 4. Pencairan Finance */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div 
            className="card-clean p-3 bg-white h-100 transition-all cursor-pointer hover-shadow"
            onClick={() => {
              if (canAccessFinance) {
                setActiveTab && setActiveTab('finance-transactions');
              } else {
                showToast('Role Anda tidak memiliki izin akses ke modul Keuangan & Kas.', 'error');
              }
            }}
            title={canAccessFinance ? "Buka modul Keuangan & Kas" : "Akses terbatas"}
          >
            <div className="d-flex justify-content-between align-items-center mb-1.5">
              <span className="text-muted fw-bold" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pencairan Finance
              </span>
              <div className="rounded-2 bg-success bg-opacity-15 text-success p-1.5">
                <CreditCard size={16} />
              </div>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-1">
              <h4 className="fw-black text-dark mb-0 font-mono" style={{ fontSize: '1.45rem' }}>
                {pendingFinancePayment + pendingZoneFinance}
              </h4>
              <span className="badge-soft badge-soft-success fw-semibold">Siap Transfer</span>
            </div>
            <div className="d-flex align-items-center justify-content-between pt-1 border-top" style={{ fontSize: '0.68rem' }}>
              <span className="text-muted">Kas: {formatCurrency(totalExpenseAmount)}</span>
              <span className="text-success fw-semibold d-inline-flex align-items-center gap-0.5">
                Proses <ChevronRight size={12} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="row g-2.5">
        {/* Left Column: Interactive Table with Tabs */}
        <div className="col-12 col-lg-8">
          <div className="card-clean h-100 overflow-hidden bg-white">
            {/* Tab Header */}
            <div className="p-2.5 px-3 border-bottom bg-light bg-opacity-40 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
              <div className="d-flex align-items-center gap-1 p-1 bg-white rounded-2 border shadow-2xs">
                {canAccessComcase && (
                  <button 
                    type="button" 
                    className={`btn btn-sm py-1 px-3 fw-bold rounded-2 border-0 transition-all ${
                      activeTableTab === 'comcase' ? 'btn-primary shadow-2xs text-white' : 'text-muted bg-transparent'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setActiveTableTab('comcase')}
                  >
                    Pengajuan Comcase ({totalComcaseCount})
                  </button>
                )}
                {canAccessZone && (
                  <button 
                    type="button" 
                    className={`btn btn-sm py-1 px-3 fw-bold rounded-2 border-0 transition-all ${
                      activeTableTab === 'zone' ? 'btn-primary shadow-2xs text-white' : 'text-muted bg-transparent'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setActiveTableTab('zone')}
                  >
                    Permohonan External ({totalZoneRequests})
                  </button>
                )}
                {canAccessHRD && (
                  <button 
                    type="button" 
                    className={`btn btn-sm py-1 px-3 fw-bold rounded-2 border-0 transition-all ${
                      activeTableTab === 'employee' ? 'btn-primary shadow-2xs text-white' : 'text-muted bg-transparent'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setActiveTableTab('employee')}
                  >
                    Data Karyawan ({employees.length})
                  </button>
                )}
                {canAccessVehicle && !canAccessComcase && (
                  <button 
                    type="button" 
                    className={`btn btn-sm py-1 px-3 fw-bold rounded-2 border-0 transition-all ${
                      activeTableTab === 'vehicle' ? 'btn-primary shadow-2xs text-white' : 'text-muted bg-transparent'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setActiveTableTab('vehicle')}
                  >
                    Armada Mobil ({vehicles.length})
                  </button>
                )}
              </div>

              <button 
                type="button"
                className="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-semibold d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.75rem' }} 
                onClick={() => {
                  if (activeTableTab === 'comcase' && canAccessComcase) setActiveTab('comcase-list');
                  else if (activeTableTab === 'zone' && canAccessZone) setActiveTab('zone-requests');
                  else if (activeTableTab === 'employee' && canAccessHRD) setActiveTab('employee-list');
                  else if (activeTableTab === 'vehicle' && canAccessVehicle) setActiveTab('vehicle-list');
                }}
              >
                <span>Buka Seluruh Data</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Table Content */}
            <div className="table-responsive">
              {activeTableTab === 'comcase' && canAccessComcase && (
                <table className="table-clean mb-0">
                  <thead>
                    <tr>
                      <th>No. Berkas</th>
                      <th>Project &amp; Site</th>
                      <th>TL &amp; Keperluan</th>
                      <th className="text-end">Nominal</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(comcases || []).slice(0, 6).map(com => (
                      <tr key={com.id}>
                        <td>
                          <strong className="font-mono text-dark d-block" style={{ fontSize: '0.78rem' }}>{com.id}</strong>
                          <span className="text-muted" style={{ fontSize: '0.68rem' }}>{com.date}</span>
                        </td>
                        <td>
                          <span className="fw-semibold text-dark d-block">{com.project}</span>
                          <span className="badge-soft badge-soft-slate font-mono" style={{ fontSize: '0.65rem' }}>{com.siteId}</span>
                        </td>
                        <td>
                          <span className="d-block text-dark fw-medium" style={{ fontSize: '0.75rem' }}>TL: {com.teamLeader}</span>
                          <span className="text-muted d-inline-block text-truncate" style={{ maxWidth: '170px', fontSize: '0.7rem' }}>
                            {com.activity}
                          </span>
                        </td>
                        <td className="text-end font-mono fw-bold text-dark" style={{ fontSize: '0.78rem' }}>
                          {formatCurrency(com.amount)}
                        </td>
                        <td className="text-center">
                          <span className={`badge-soft ${
                            (com.status || '').includes('Review Zone') ? 'badge-soft-primary' :
                            (com.status || '').includes('Approval Manager') ? 'badge-soft-warning' :
                            (com.status || '').includes('Disetujui') ? 'badge-soft-primary' :
                            (com.status || '').includes('Ditolak') ? 'badge-soft-danger' :
                            'badge-soft-success'
                          }`}>
                            {com.status}
                          </span>
                        </td>
                        <td className="text-center">
                          <button 
                            type="button"
                            className="btn btn-sm btn-light border py-0.5 px-2 text-primary" 
                            style={{ fontSize: '0.72rem', fontWeight: 600 }} 
                            onClick={() => onViewComcaseDetail && onViewComcaseDetail(com)}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(comcases || []).length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted small">
                          <FileText size={24} className="d-block mx-auto mb-2 text-muted opacity-50" />
                          Belum ada data pengajuan Comcase.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {activeTableTab === 'zone' && canAccessZone && (
                <table className="table-clean mb-0">
                  <thead>
                    <tr>
                      <th>No. Surat</th>
                      <th>Zona &amp; Keperluan</th>
                      <th>Pemohon</th>
                      <th className="text-end">Nominal</th>
                      <th className="text-center">Status TTD</th>
                      <th className="text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(zoneRequests || []).slice(0, 6).map(req => (
                      <tr key={req.id}>
                        <td>
                          <strong className="font-mono text-dark d-block" style={{ fontSize: '0.78rem' }}>{req.id}</strong>
                          <span className="text-muted" style={{ fontSize: '0.68rem' }}>{req.date || req.created_at?.split(' ')[0]}</span>
                        </td>
                        <td>
                          <span className="fw-semibold text-dark d-block">{req.zone || req.area || 'Operasional'}</span>
                          <span className="text-muted d-inline-block text-truncate" style={{ maxWidth: '170px', fontSize: '0.7rem' }}>
                            {req.purpose || req.description}
                          </span>
                        </td>
                        <td>
                          <span className="text-dark fw-medium d-block" style={{ fontSize: '0.75rem' }}>
                            {req.requester_name || req.requesterName || 'Zone Manager'}
                          </span>
                        </td>
                        <td className="text-end font-mono fw-bold text-dark" style={{ fontSize: '0.78rem' }}>
                          {formatCurrency(req.amount)}
                        </td>
                        <td className="text-center">
                          <span className={`badge-soft ${
                            (req.status || '').toLowerCase().includes('dicairkan') ? 'badge-soft-success' :
                            (req.status || '').toLowerCase().includes('ttd owner') ? 'badge-soft-purple' :
                            (req.status || '').toLowerCase().includes('ttd gm') ? 'badge-soft-primary' :
                            'badge-soft-warning'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="text-center">
                          <button 
                            type="button"
                            className="btn btn-sm btn-light border py-0.5 px-2 text-primary" 
                            style={{ fontSize: '0.72rem', fontWeight: 600 }} 
                            onClick={() => onViewZoneDetail && onViewZoneDetail(req)}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(zoneRequests || []).length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted small">
                          <FileCheck size={24} className="d-block mx-auto mb-2 text-muted opacity-50" />
                          Belum ada permohonan dana external.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {activeTableTab === 'employee' && canAccessHRD && (
                <table className="table-clean mb-0">
                  <thead>
                    <tr>
                      <th>NIP / ID</th>
                      <th>Nama Lengkap</th>
                      <th>Jabatan &amp; Divisi</th>
                      <th>Tipe / Kontrak</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(employees || []).slice(0, 6).map(emp => (
                      <tr key={emp.id || emp.nip}>
                        <td>
                          <strong className="font-mono text-dark d-block" style={{ fontSize: '0.78rem' }}>{emp.nip || emp.nik || '-'}</strong>
                          <span className="text-muted" style={{ fontSize: '0.68rem' }}>BST-{emp.id}</span>
                        </td>
                        <td>
                          <span className="fw-bold text-dark d-block" style={{ fontSize: '0.78rem' }}>{emp.name}</span>
                          <span className="text-muted" style={{ fontSize: '0.68rem' }}>{emp.gender || 'Laki-laki'}</span>
                        </td>
                        <td>
                          <span className="text-dark fw-medium d-block" style={{ fontSize: '0.75rem' }}>{emp.position || '-'}</span>
                          <span className="badge-soft badge-soft-slate font-mono" style={{ fontSize: '0.65rem' }}>{emp.department || 'Operasional'}</span>
                        </td>
                        <td>
                          <span className="d-block text-dark" style={{ fontSize: '0.75rem' }}>{emp.employee_type || emp.type || 'Field Worker'}</span>
                          <span className="text-muted" style={{ fontSize: '0.68rem' }}>PKWT {emp.pkwt_duration || '6'} Bln</span>
                        </td>
                        <td className="text-center">
                          <span className={`badge-soft ${(emp.status || 'aktif').toLowerCase() === 'aktif' ? 'badge-soft-success' : 'badge-soft-danger'}`}>
                            {emp.status || 'Aktif'}
                          </span>
                        </td>
                        <td className="text-center">
                          <button 
                            type="button"
                            className="btn btn-sm btn-light border py-0.5 px-2 text-primary" 
                            style={{ fontSize: '0.72rem', fontWeight: 600 }} 
                            onClick={() => setActiveTab && setActiveTab('employee-list')}
                          >
                            Kelola
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(employees || []).length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted small">
                          <Users size={24} className="d-block mx-auto mb-2 text-muted opacity-50" />
                          Belum ada data karyawan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {activeTableTab === 'vehicle' && canAccessVehicle && (
                <table className="table-clean mb-0">
                  <thead>
                    <tr>
                      <th>Plat Nomor</th>
                      <th>Merk &amp; Tipe Unit</th>
                      <th>Driver Penanggung Jawab</th>
                      <th>Kontak Driver</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(vehicles || []).slice(0, 6).map(veh => (
                      <tr key={veh.id || veh.plateNumber}>
                        <td>
                          <strong className="font-mono text-dark d-block" style={{ fontSize: '0.78rem' }}>{veh.plateNumber || veh.plate_number}</strong>
                        </td>
                        <td>
                          <span className="fw-semibold text-dark d-block">{veh.brandModel || veh.model || '-'}</span>
                          <span className="text-muted" style={{ fontSize: '0.68rem' }}>{veh.type || 'Operasional'}</span>
                        </td>
                        <td>
                          <span className="text-dark fw-medium d-block" style={{ fontSize: '0.75rem' }}>{veh.driverName || veh.driver_name || 'Belum Ditugaskan'}</span>
                        </td>
                        <td className="font-mono text-muted" style={{ fontSize: '0.72rem' }}>
                          {veh.driverWhatsapp || veh.driver_whatsapp || '-'}
                        </td>
                        <td className="text-center">
                          <span className={`badge-soft ${(veh.status || '').toLowerCase() === 'tersedia' ? 'badge-soft-success' : 'badge-soft-warning'}`}>
                            {veh.status || 'Tersedia'}
                          </span>
                        </td>
                        <td className="text-center">
                          <button 
                            type="button"
                            className="btn btn-sm btn-light border py-0.5 px-2 text-primary" 
                            style={{ fontSize: '0.72rem', fontWeight: 600 }} 
                            onClick={() => setActiveTab && setActiveTab('vehicle-list')}
                          >
                            Kelola
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(vehicles || []).length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted small">
                          <Truck size={24} className="d-block mx-auto mb-2 text-muted opacity-50" />
                          Belum ada unit armada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Tier Workflow Tracker & Operational Readiness */}
        <div className="col-12 col-lg-4">
          <div className="d-flex flex-column gap-2.5">
            {/* 1. Alur Otorisasi Surat PDF Zona */}
            <div className="card-clean p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-2.5 pb-1.5 border-bottom">
                <div className="d-flex align-items-center gap-1.5">
                  <FileCheck size={16} className="text-primary" />
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.8rem' }}>Alur Otorisasi PDF Zona</h6>
                </div>
                <button 
                  type="button" 
                  className="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-semibold" 
                  style={{ fontSize: '0.72rem' }} 
                  onClick={() => {
                    if (canAccessZone) setActiveTab('zone-requests');
                    else showToast('Role Anda tidak memiliki akses ke Permohonan Zona.', 'error');
                  }}
                >
                  Lihat Semua &rarr;
                </button>
              </div>

              <div className="d-flex flex-column gap-1.5">
                <div className="p-2 bg-light rounded-2 d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
                  <span className="text-muted">1. Menunggu TTD Manager:</span>
                  <span className={`badge-soft font-mono ${pendingZoneTtdManager > 0 ? 'badge-soft-warning fw-bold' : 'badge-soft-slate'}`}>
                    {pendingZoneTtdManager}
                  </span>
                </div>
                <div className="p-2 bg-light rounded-2 d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
                  <span className="text-muted">2. Menunggu TTD GM:</span>
                  <span className={`badge-soft font-mono ${pendingZoneTtdGm > 0 ? 'badge-soft-primary fw-bold' : 'badge-soft-slate'}`}>
                    {pendingZoneTtdGm}
                  </span>
                </div>
                <div className="p-2 bg-light rounded-2 d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
                  <span className="text-muted">3. Menunggu TTD Owner:</span>
                  <span className={`badge-soft font-mono ${pendingZoneTtdOwner > 0 ? 'badge-soft-purple fw-bold' : 'badge-soft-slate'}`}>
                    {pendingZoneTtdOwner}
                  </span>
                </div>
                <div className="p-2 bg-light rounded-2 d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
                  <span className="text-muted">4. Siap Cair di Finance:</span>
                  <span className={`badge-soft font-mono ${pendingZoneFinance > 0 ? 'badge-soft-success fw-bold' : 'badge-soft-slate'}`}>
                    {pendingZoneFinance}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Kesiapan Armada & Karyawan Operasional */}
            <div className="card-clean p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-2.5 pb-1.5 border-bottom">
                <div className="d-flex align-items-center gap-1.5">
                  <Activity size={16} className="text-primary" />
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.8rem' }}>Kesiapan Operasional</h6>
                </div>
                <button 
                  type="button" 
                  className="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-semibold" 
                  style={{ fontSize: '0.72rem' }} 
                  onClick={() => {
                    if (canAccessVehicle) setActiveTab('vehicle-list');
                    else showToast('Role Anda tidak memiliki akses ke Armada.', 'error');
                  }}
                >
                  Armada &rarr;
                </button>
              </div>

              <div className="row g-2">
                {/* Armada Mobil */}
                <div className="col-6">
                  <div className="p-2.5 bg-light rounded-2 border text-center">
                    <Truck size={18} className="text-primary mx-auto mb-1 d-block" />
                    <h5 className="fw-black text-dark mb-0 font-mono" style={{ fontSize: '1.15rem' }}>
                      {availableVehicles}
                    </h5>
                    <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>
                      Unit Siap ({vehicles.length} Total)
                    </span>
                  </div>
                </div>

                {/* Personel Karyawan */}
                <div className="col-6">
                  <div className="p-2.5 bg-light rounded-2 border text-center">
                    <Users size={18} className="text-success mx-auto mb-1 d-block" />
                    <h5 className="fw-black text-dark mb-0 font-mono" style={{ fontSize: '1.15rem' }}>
                      {activeEmployees}
                    </h5>
                    <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>
                      Staf Aktif ({employees.length} Total)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Pintasan Tindakan Cepat (Strictly Permission-Aware) */}
            <div className="card-clean p-3 bg-white">
              <span className="text-muted fw-bold d-block mb-2 pb-1 border-bottom" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                Pintasan Akses Cepat
              </span>
              <div className="d-grid gap-1.5">
                {canCreateComcase && (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-light border text-start d-flex align-items-center justify-content-between px-2.5 py-1.5 hover-bg-primary text-dark"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setActiveTab && setActiveTab('comcase-form')}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <Plus size={13} className="text-primary" />
                      <span>Buat Pengajuan Comcase</span>
                    </span>
                    <ChevronRight size={13} className="text-muted" />
                  </button>
                )}

                {canCreateZone && (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-light border text-start d-flex align-items-center justify-content-between px-2.5 py-1.5 hover-bg-primary text-dark"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setActiveTab && setActiveTab('zone-request-form')}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <Plus size={13} className="text-info" />
                      <span>Permohonan External Baru</span>
                    </span>
                    <ChevronRight size={13} className="text-muted" />
                  </button>
                )}

                {canCreateFinance && (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-light border text-start d-flex align-items-center justify-content-between px-2.5 py-1.5 hover-bg-primary text-dark"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setActiveTab && setActiveTab('finance-input')}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <Plus size={13} className="text-success" />
                      <span>Input Pengeluaran Kas</span>
                    </span>
                    <ChevronRight size={13} className="text-muted" />
                  </button>
                )}

                {canCreateHRD && (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-light border text-start d-flex align-items-center justify-content-between px-2.5 py-1.5 hover-bg-primary text-dark"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setActiveTab && setActiveTab('employee-form')}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <Plus size={13} className="text-primary" />
                      <span>Tambah Karyawan Baru</span>
                    </span>
                    <ChevronRight size={13} className="text-muted" />
                  </button>
                )}

                {canAssignVehicle && (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-light border text-start d-flex align-items-center justify-content-between px-2.5 py-1.5 hover-bg-primary text-dark"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setActiveTab && setActiveTab('asset-assignment')}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <Truck size={13} className="text-info" />
                      <span>Penugasan Aset Armada</span>
                    </span>
                    <ChevronRight size={13} className="text-muted" />
                  </button>
                )}

                {canCreateVehicle && (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-light border text-start d-flex align-items-center justify-content-between px-2.5 py-1.5 hover-bg-primary text-dark"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setActiveTab && setActiveTab('vehicle-form')}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <Plus size={13} className="text-success" />
                      <span>Tambah Armada Mobil</span>
                    </span>
                    <ChevronRight size={13} className="text-muted" />
                  </button>
                )}

                {canAccessBBM && (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-light border text-start d-flex align-items-center justify-content-between px-2.5 py-1.5 hover-bg-primary text-dark"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setActiveTab && setActiveTab('user-bbm-validation')}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={13} className="text-success" />
                      <span>Validasi Nota BBM</span>
                    </span>
                    <ChevronRight size={13} className="text-muted" />
                  </button>
                )}

                {!canCreateComcase && !canCreateZone && !canCreateFinance && !canCreateHRD && !canCreateVehicle && !canAssignVehicle && !canAccessBBM && (
                  <div className="p-2 text-center text-muted small">
                    Pilih modul yang tersedia melalui menu bilah sisi kiri.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
