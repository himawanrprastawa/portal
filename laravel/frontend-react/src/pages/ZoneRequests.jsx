import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileCheck, 
  UploadCloud, 
  Search, 
  PenTool, 
  Trash2,
  Clock,
  CheckCircle2,
  Eye
} from 'lucide-react';

export default function ZoneRequests({ 
  zoneRequests, 
  onViewDetail, 
  onOpenSign, 
  onOpenCreate, 
  onDelete 
}) {
  const { hasAccess, formatCurrency, currentUser } = useAuth();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 5-Tier Stats
  const total = (zoneRequests || []).length;
  const pendingMgr = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('ttd manager') || r.status === 'Pending').length;
  const pendingGm = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('ttd checker (gm)')).length;
  const pendingFinance = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('ttd checker (finance)')).length;
  const pendingDireksi = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('ttd approval (direksi)') || (r.status || '').toLowerCase().includes('ttd owner')).length;
  const readyFinance = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('disetujui sah direksi') || (r.status || '').toLowerCase().includes('disetujui owner') || (r.status || '').toLowerCase().includes('menunggu pencairan')).length;
  const completed = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('sudah dicairkan')).length;

  const filtered = (zoneRequests || []).filter(req => {
    if (filterStatus !== 'All' && req.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = req.request_number && req.request_number.toLowerCase().includes(q);
      const matchTitle = req.title && req.title.toLowerCase().includes(q);
      const matchZone = req.zone_name && req.zone_name.toLowerCase().includes(q);
      const matchRequester = req.requester_name && req.requester_name.toLowerCase().includes(q);
      return matchNum || matchTitle || matchZone || matchRequester;
    }
    return true;
  });

  const isMaster = currentUser?.role === 'Master' || (currentUser?.role || '').toLowerCase().includes('master');
  const userRole = (currentUser?.role || '').toLowerCase();
  const isManager = userRole === 'manager' || userRole.includes('manager ops');
  const isGM = userRole.includes('general manager') || userRole === 'gm';
  const isFinance = userRole.includes('finance');
  const isDireksi = userRole.includes('direksi') || userRole.includes('owner');

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Header & Upload Button */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark mb-0.5" style={{ letterSpacing: '-0.02em' }}>Permohonan External &amp; Tanda Tangan PDF</h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
            Alur otorisasi 5-tier: <strong>1. Requester (Zone) &rarr; 2. Manager &rarr; 3. Checker (GM) &rarr; 4. Checker (Finance) &rarr; 5. Approval (Direksi)</strong>
          </p>
        </div>
        {(hasAccess('ZoneManager', 'create') || userRole.includes('zone') || isMaster) && (
          <button className="btn btn-primary btn-sm fw-semibold d-flex align-items-center gap-1.5 shadow-2xs" style={{ fontSize: '0.75rem' }} onClick={onOpenCreate}>
            <UploadCloud size={13} />
            <span>+ Upload Permohonan External (PDF)</span>
          </button>
        )}
      </div>

      {/* KPI Counters (5-Tier Flow) */}
      <div className="row g-2 mb-3">
        <div className="col-6 col-md-2">
          <div className="card-stat p-2 text-center">
            <span className="text-muted d-block" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Total Surat</span>
            <strong className="fw-black text-dark font-mono" style={{ fontSize: '1.1rem' }}>{total}</strong>
          </div>
        </div>
        <div className="col-6 col-md-2">
          <div className="card-stat p-2 text-center">
            <span className="text-warning-emphasis d-block fw-semibold" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>1. TTD Mgr</span>
            <strong className="fw-black text-warning-emphasis font-mono" style={{ fontSize: '1.1rem' }}>{pendingMgr}</strong>
          </div>
        </div>
        <div className="col-6 col-md-2">
          <div className="card-stat p-2 text-center">
            <span className="text-primary d-block fw-semibold" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>2. Checker (GM)</span>
            <strong className="fw-black text-primary font-mono" style={{ fontSize: '1.1rem' }}>{pendingGm}</strong>
          </div>
        </div>
        <div className="col-6 col-md-2">
          <div className="card-stat p-2 text-center">
            <span className="text-success d-block fw-semibold" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>3. Checker (Fin)</span>
            <strong className="fw-black text-success font-mono" style={{ fontSize: '1.1rem' }}>{pendingFinance}</strong>
          </div>
        </div>
        <div className="col-6 col-md-2">
          <div className="card-stat p-2 text-center">
            <span className="d-block fw-semibold" style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#7e22ce' }}>4. Approval (Dir)</span>
            <strong className="fw-black font-mono" style={{ fontSize: '1.1rem', color: '#7e22ce' }}>{pendingDireksi}</strong>
          </div>
        </div>
        <div className="col-6 col-md-2">
          <div className="card-stat p-2 text-center">
            <span className="text-muted d-block" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Lunas Cair</span>
            <strong className="fw-black text-dark font-mono" style={{ fontSize: '1.1rem' }}>{completed}</strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-clean mb-3 p-2.5 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5 d-flex align-items-center gap-2">
            <span className="text-muted fw-bold text-nowrap" style={{ fontSize: '0.75rem' }}>Filter Status:</span>
            <select 
              className="form-select form-select-sm form-control-clean"
              style={{ fontSize: '0.78rem' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">Semua Tahapan Permohonan</option>
              <option value="Menunggu TTD Manager">Menunggu TTD Manager</option>
              <option value="Menunggu TTD Checker (GM)">Menunggu TTD Checker (GM)</option>
              <option value="Menunggu TTD Checker (Finance)">Menunggu TTD Checker (Finance)</option>
              <option value="Menunggu TTD Approval (Direksi)">Menunggu TTD Approval (Direksi)</option>
              <option value="Disetujui Sah Direksi (Siap Pencairan Dana)">Disetujui Sah Direksi (Siap Cair)</option>
              <option value="Sudah Dicairkan Finance">Sudah Dicairkan Finance</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          <div className="col-12 col-md-7">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                className="form-control form-control-clean border-start-0 ps-0"
                style={{ fontSize: '0.78rem' }}
                placeholder="Cari Nomor Surat, Perihal, Wilayah, Pemohon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table List of External Requests */}
      <div className="card-clean overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Nomor Surat / Wilayah</th>
                <th>Perihal Permohonan</th>
                <th>Pemohon (Requester)</th>
                <th className="text-end">Estimasi Biaya</th>
                <th>Status Otorisasi (5 Tahap)</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => {
                const canSignNow = 
                  (isManager && req.status === 'Menunggu TTD Manager') ||
                  (isGM && req.status === 'Menunggu TTD Checker (GM)') ||
                  (isFinance && req.status === 'Menunggu TTD Checker (Finance)') ||
                  (isDireksi && req.status === 'Menunggu TTD Approval (Direksi)') ||
                  isMaster;

                const currentRole = isManager ? 'manager' : isGM ? 'gm' : isFinance ? 'finance' : isDireksi ? 'owner' : 'manager';

                return (
                  <tr key={req.id}>
                    <td>
                      <div>
                        <strong className="font-mono text-dark d-block" style={{ fontSize: '0.78rem' }}>{req.request_number}</strong>
                        <span className="badge-soft badge-soft-slate" style={{ fontSize: '0.68rem' }}>{req.zone_name}</span>
                      </div>
                    </td>
                    <td>
                      <strong className="text-dark d-block" style={{ fontSize: '0.8rem' }}>{req.title}</strong>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>{req.category || 'Operasional'}</small>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.78rem' }}>{req.requester_name}</span>
                      <small className="text-muted font-mono" style={{ fontSize: '0.68rem' }}>{req.created_at ? req.created_at.substring(0, 10) : '-'}</small>
                    </td>
                    <td className="text-end">
                      <strong className="font-mono text-primary d-block" style={{ fontSize: '0.82rem' }}>
                        {formatCurrency(req.estimated_cost)}
                      </strong>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <span className={`badge-soft ${
                          req.status.includes('Menunggu TTD Manager') ? 'badge-soft-warning' :
                          req.status.includes('Menunggu TTD Checker (GM)') ? 'badge-soft-primary' :
                          req.status.includes('Menunggu TTD Checker (Finance)') ? 'badge-soft-success' :
                          req.status.includes('Menunggu TTD Approval') ? 'badge-soft-purple' :
                          req.status.includes('Disetujui') ? 'badge-soft-success font-bold' :
                          req.status.includes('Sudah Dicairkan') ? 'badge-soft-success font-bold' :
                          'badge-soft-slate'
                        }`} style={{ fontSize: '0.68rem', width: 'fit-content' }}>
                          {req.status}
                        </span>

                        {/* Signer badges summary (5-Tier) */}
                        <div className="d-flex gap-1" style={{ fontSize: '0.62rem' }}>
                          <span className={`badge ${req.requester_signed_at || req.requester_signature ? 'bg-success' : 'bg-light text-muted border'}`} title="1. Requester Zone Mgr">Req</span>
                          <span className={`badge ${req.manager_signed_at ? 'bg-success' : 'bg-light text-muted border'}`} title="2. Manager Ops">Mgr</span>
                          <span className={`badge ${req.gm_signed_at ? 'bg-success' : 'bg-light text-muted border'}`} title="3. Checker GM">GM</span>
                          <span className={`badge ${req.finance_checker_signed_at ? 'bg-success' : 'bg-light text-muted border'}`} title="4. Checker Finance">Fin</span>
                          <span className={`badge ${req.owner_signed_at ? 'bg-success' : 'bg-light text-muted border'}`} title="5. Approval Direksi">Dir</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        {/* Detail Button (Icon Only) */}
                        <button 
                          className="btn btn-sm btn-light border text-secondary p-1 rounded-2 shadow-2xs d-inline-flex align-items-center justify-content-center"
                          style={{ width: '30px', height: '30px' }}
                          onClick={() => onViewDetail(req)}
                          title="Lihat Detail Dokumen"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Direct TTD Button if actionable (Icon Only) */}
                        {canSignNow && (
                          <button 
                            className="btn btn-sm btn-primary p-1 rounded-2 shadow-2xs d-inline-flex align-items-center justify-content-center"
                            style={{ width: '30px', height: '30px' }}
                            onClick={() => onOpenSign(req, currentRole)}
                            title="Bubuhkan Tanda Tangan"
                          >
                            <PenTool size={13} />
                          </button>
                        )}

                        {/* Delete button: hanya boleh dihapus jika belum ditandatangani oleh General Manager */}
                        {!req.gm_signed_at && (isMaster || userRole.includes('zone') || userRole.includes('finance') || hasAccess('Finance')) && (
                          <button 
                            className="btn btn-sm btn-light border text-danger p-1 rounded-2 shadow-2xs d-inline-flex align-items-center justify-content-center"
                            style={{ width: '30px', height: '30px' }}
                            onClick={() => onDelete(req.id)}
                            title="Hapus Permohonan (Belum TTD GM)"
                          >
                            <Trash2 size={14} />
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
                    Tidak ada dokumen permohonan external yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
