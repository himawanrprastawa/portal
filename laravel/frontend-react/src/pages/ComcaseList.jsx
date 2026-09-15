import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Send, Search, Trash2, ShieldCheck, CheckCircle2, CreditCard, Clock, ChevronRight } from 'lucide-react';

export default function ComcaseList({ 
  comcases, 
  onViewDetail, 
  onOpenApproval, 
  onEditRejected, 
  onDelete, 
  onOpenPayment,
  onOpenCreate
}) {
  const { hasAccess, formatCurrency, currentUser } = useAuth();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Dashboard metric calculations
  const totalCount = (comcases || []).length;
  const zonePendingCount = (comcases || []).filter(c => (c.status || '').toLowerCase().includes('review zone')).length;
  const managerPendingCount = (comcases || []).filter(c => (c.status || '').toLowerCase().includes('approval manager')).length;
  const financePaidCount = (comcases || []).filter(c => (c.status || '').toLowerCase().includes('sudah dibayar') || (c.status || '').toLowerCase().includes('disetujui manager')).length;

  // Filtered comcases
  const filtered = (comcases || []).filter(com => {
    if (filterStatus !== 'All' && com.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = com.id && com.id.toLowerCase().includes(q);
      const matchProject = com.project && com.project.toLowerCase().includes(q);
      const matchSite = (com.siteId || com.site_id) && (com.siteId || com.site_id).toLowerCase().includes(q);
      const matchTl = (com.teamLeader || com.team_leader) && (com.teamLeader || com.team_leader).toLowerCase().includes(q);
      const matchRecipient = (com.recipientName || com.recipient_name) && (com.recipientName || com.recipient_name).toLowerCase().includes(q);
      return matchId || matchProject || matchSite || matchTl || matchRecipient;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('review zone')) return 'badge-soft badge-soft-primary';
    if (s.includes('approval manager')) return 'badge-soft badge-soft-warning';
    if (s.includes('disetujui')) return 'badge-soft badge-soft-primary';
    if (s.includes('ditolak')) return 'badge-soft badge-soft-danger';
    if (s.includes('dibayar')) return 'badge-soft badge-soft-success';
    return 'badge-soft badge-soft-slate';
  };

  const canDeleteComcase = (com) => {
    if (currentUser?.role === 'Master' || (currentUser?.role || '').toLowerCase().includes('master')) {
      return true;
    }
    const submitter = (com.submitted_by || com.submittedBy || '').toLowerCase().trim();
    const myUsername = (currentUser?.username || '').toLowerCase().trim();
    const myName = (currentUser?.employee_name || '').toLowerCase().trim();
    if (submitter && (submitter === myUsername || submitter === myName)) {
      return true;
    }
    return false;
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark mb-0.5" style={{ letterSpacing: '-0.02em' }}>Daftar Pengajuan Comcase</h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
            Alur pengajuan darurat site: <strong>Supervisor &rarr; Zone Manager &rarr; Manager &rarr; Finance</strong>
          </p>
        </div>
        {hasAccess('Supervisor', 'create') && (
          <button className="btn btn-warning btn-sm fw-semibold d-flex align-items-center gap-1.5 shadow-2xs" style={{ fontSize: '0.75rem' }} onClick={onOpenCreate}>
            <Send size={13} />
            <span>Request Comcase Baru</span>
          </button>
        )}
      </div>

      {/* Mini Dashboard 4-Tahap */}
      <div className="row g-2.5 mb-3">
        {/* Card 1: Request Comcase */}
        <div className="col-6 col-md-3">
          <div 
            className={`card-clean p-2.5 bg-white cursor-pointer border transition-all ${filterStatus === 'All' ? 'border-primary shadow-xs' : 'border-light'}`}
            onClick={() => setFilterStatus('All')}
            style={{ borderRadius: '10px' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block text-uppercase font-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.02em' }}>
                  Request Comcase
                </span>
                <h4 className="fw-bold text-dark mb-0 font-mono" style={{ fontSize: '1.25rem' }}>{totalCount}</h4>
              </div>
              <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                <FileText size={18} />
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-top d-flex align-items-center justify-content-between text-2xs text-muted">
              <span>Semua Pengajuan</span>
              <ChevronRight size={12} />
            </div>
          </div>
        </div>

        {/* Card 2: Approval Zone Manager */}
        <div className="col-6 col-md-3">
          <div 
            className={`card-clean p-2.5 bg-white cursor-pointer border transition-all ${filterStatus === 'Menunggu Review Zone Manager' ? 'border-primary shadow-xs' : 'border-light'}`}
            onClick={() => setFilterStatus('Menunggu Review Zone Manager')}
            style={{ borderRadius: '10px' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block text-uppercase font-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.02em' }}>
                  Review Zone Manager
                </span>
                <h4 className="fw-bold text-primary mb-0 font-mono" style={{ fontSize: '1.25rem' }}>{zonePendingCount}</h4>
              </div>
              <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-top d-flex align-items-center justify-content-between text-2xs text-muted">
              <span>Menunggu Review</span>
              <ChevronRight size={12} />
            </div>
          </div>
        </div>

        {/* Card 3: Approval Manager */}
        <div className="col-6 col-md-3">
          <div 
            className={`card-clean p-2.5 bg-white cursor-pointer border transition-all ${filterStatus === 'Menunggu Approval Manager Operasional' ? 'border-warning shadow-xs' : 'border-light'}`}
            onClick={() => setFilterStatus('Menunggu Approval Manager Operasional')}
            style={{ borderRadius: '10px' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block text-uppercase font-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.02em' }}>
                  Approval Manager
                </span>
                <h4 className="fw-bold text-warning mb-0 font-mono" style={{ fontSize: '1.25rem' }}>{managerPendingCount}</h4>
              </div>
              <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-top d-flex align-items-center justify-content-between text-2xs text-muted">
              <span>Menunggu Approval</span>
              <ChevronRight size={12} />
            </div>
          </div>
        </div>

        {/* Card 4: Pembayaran Finance */}
        <div className="col-6 col-md-3">
          <div 
            className={`card-clean p-2.5 bg-white cursor-pointer border transition-all ${filterStatus === 'Sudah Dibayar' ? 'border-success shadow-xs' : 'border-light'}`}
            onClick={() => setFilterStatus('Sudah Dibayar')}
            style={{ borderRadius: '10px' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block text-uppercase font-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.02em' }}>
                  Pembayaran Finance
                </span>
                <h4 className="fw-bold text-success mb-0 font-mono" style={{ fontSize: '1.25rem' }}>{financePaidCount}</h4>
              </div>
              <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-top d-flex align-items-center justify-content-between text-2xs text-muted">
              <span>Pencairan Dana</span>
              <ChevronRight size={12} />
            </div>
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
              <option value="All">Semua Status Comcase</option>
              <option value="Menunggu Review Zone Manager">Menunggu Review Zone Manager</option>
              <option value="Menunggu Approval Manager Operasional">Menunggu Approval Manager</option>
              <option value="Disetujui Manager">Disetujui Manager (Siap Bayar)</option>
              <option value="Ditolak Zone Manager">Ditolak Zone Manager</option>
              <option value="Ditolak Manager">Ditolak Manager</option>
              <option value="Sudah Dibayar">Sudah Dibayar Finance</option>
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
                placeholder="Cari No. Comcase, Project, Site ID, Team Leader, Penerima..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Data Card */}
      <div className="card-clean overflow-hidden">
        <div className="table-responsive">
          <table className="table-clean">
            <thead>
              <tr>
                <th>No. Berkas &amp; Tgl</th>
                <th>Project &amp; Site</th>
                <th>Team Leader &amp; Aktivitas</th>
                <th>Penerima &amp; Rekening</th>
                <th className="text-end">Nominal</th>
                <th className="text-center">Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(com => (
                <tr key={com.id}>
                  <td>
                    <strong className="font-mono text-dark d-block" style={{ fontSize: '0.78rem' }}>{com.id}</strong>
                    <span className="text-muted" style={{ fontSize: '0.68rem' }}>{com.date}</span>
                  </td>
                  <td>
                    <span className="fw-semibold text-dark d-block">{com.project}</span>
                    <span className="badge-soft badge-soft-slate font-mono" style={{ fontSize: '0.65rem' }}>SITE: {com.siteId || com.site_id || '-'}</span>
                  </td>
                  <td>
                    <span className="fw-medium text-dark d-block" style={{ fontSize: '0.75rem' }}>TL: {com.teamLeader || com.team_leader || com.submitted_by || com.submittedBy || '-'}</span>
                    <p className="text-muted mb-0 small text-truncate" style={{ maxWidth: '180px', fontSize: '0.7rem' }}>
                      {com.activity}
                    </p>
                  </td>
                  <td>
                    <strong className="text-dark d-block" style={{ fontSize: '0.75rem' }}>{com.recipientName || com.recipient_name || '-'}</strong>
                    <span className="text-muted font-mono" style={{ fontSize: '0.68rem' }}>{(com.bankName || com.bank_name || 'BCA')} - {(com.accountNumber || com.account_number || '-')}</span>
                  </td>
                  <td className="text-end font-mono fw-bold text-dark" style={{ fontSize: '0.78rem' }}>
                    {formatCurrency(com.amount)}
                  </td>
                  <td className="text-center">
                    <span className={getStatusBadge(com.status)}>
                      {com.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-1 flex-wrap">
                      <button 
                        className="btn btn-sm btn-light border py-0.5 px-2 text-xs font-semibold" 
                        onClick={() => onViewDetail(com)}
                      >
                        Detail
                      </button>

                      {/* Zone Manager Review Button */}
                      {(hasAccess('ZoneManager') || (currentUser?.role || '').toLowerCase().includes('zone')) && com.status === 'Menunggu Review Zone Manager' && (
                        <button 
                          className="btn btn-primary btn-sm py-0.5 px-2 text-xs fw-semibold" 
                          onClick={() => onOpenApproval(com, 'zone')}
                        >
                          Review Zona
                        </button>
                      )}

                      {/* Manager Review Button (Strictly Manager Tier only, not Zone Manager) */}
                      {hasAccess('Manager') && !((currentUser?.role || '').toLowerCase().includes('zone')) && (com.status === 'Menunggu Approval Manager Operasional' || com.status === 'Menunggu Approval Manager') && (
                        <button 
                          className="btn btn-dark btn-sm py-0.5 px-2 text-xs fw-semibold" 
                          onClick={() => onOpenApproval(com, 'manager')}
                        >
                          Review Mgr
                        </button>
                      )}

                      {/* Finance Pay Button */}
                      {hasAccess('Finance') && com.status === 'Disetujui Manager' && (
                        <button 
                          className="btn btn-success btn-sm py-0.5 px-2 text-xs fw-semibold" 
                          onClick={() => onOpenPayment(com)}
                        >
                          Bayar
                        </button>
                      )}

                      {/* Supervisor Revisi Button if rejected */}
                      {hasAccess('Supervisor') && (com.status === 'Ditolak Manager' || com.status === 'Ditolak Zone Manager') && (
                        <button 
                          className="btn btn-danger btn-sm py-0.5 px-2 text-xs fw-semibold" 
                          onClick={() => onEditRejected(com)}
                        >
                          Revisi
                        </button>
                      )}

                      {/* Delete button (Only submitter user who requested it or Master) */}
                      {canDeleteComcase(com) && (
                        <button 
                          className="btn btn-outline-danger btn-sm py-0.5 px-1.5 text-xs" 
                          onClick={() => onDelete(com.id)}
                          title="Hapus Pengajuan Comcase Anda"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted small">
                    Tidak ada pengajuan Comcase yang sesuai filter.
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
