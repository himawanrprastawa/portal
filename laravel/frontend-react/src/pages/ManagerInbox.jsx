import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Inbox, 
  Search, 
  CheckCircle, 
  PenTool, 
  FileText, 
  Calendar, 
  AlertCircle,
  FileCheck,
  Eye,
  Filter
} from 'lucide-react';

export default function ManagerInbox({ 
  comcases, 
  zoneRequests, 
  onViewComcaseDetail, 
  onViewZoneDetail, 
  onOpenComcaseApproval, 
  onOpenComcasePayment,
  onOpenZoneSign 
}) {
  const { formatCurrency, currentUser } = useAuth();
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'COMCASE', 'EXTERNAL'
  const [searchQuery, setSearchQuery] = useState('');

  const isMaster = currentUser?.role === 'Master' || (currentUser?.role || '').toLowerCase().includes('master');
  const userRole = (currentUser?.role || '').toLowerCase();
  const isGM = userRole.includes('general manager') || userRole === 'gm';
  const isDireksi = userRole.includes('direksi') || userRole.includes('owner');
  const isZoneManager = userRole.includes('zone');
  const isFinance = userRole.includes('finance');
  const isManager = !isZoneManager && !isFinance && (userRole === 'manager' || userRole.includes('manager ops'));

  const currentSigningRole = isGM ? 'gm' : isDireksi ? 'owner' : isFinance ? 'finance' : isManager ? 'manager' : isZoneManager ? 'requester' : 'manager';

  // 1. Pending Comcases (Zone Manager strictly reviews zone stage; Manager strictly approves manager stage; Finance handles payment; GM & Direksi do not approve comcases)
  const pendingComcases = (comcases || []).filter(c => {
    if (isGM || isDireksi) return false;
    if ((c.status || '').includes('Ditolak') || (c.status || '').toLowerCase() === 'selesai' || (c.status || '').toLowerCase() === 'dibayar finance' || (c.status || '').toLowerCase() === 'sudah dibayar') return false;
    if (isMaster) return !c.managerApproval?.approvedBy;
    if (isZoneManager) {
      return (c.status || '').toLowerCase().includes('review zone');
    }
    if (isManager) {
      return (c.status || '').toLowerCase().includes('approval manager');
    }
    if (isFinance) {
      return (c.status || '').toLowerCase() === 'disetujui manager';
    }
    return false;
  });

  // 2. Pending External Requests strictly requiring active account's signature / payment
  const pendingZoneRequests = (zoneRequests || []).filter(r => {
    if (r.status === 'Ditolak' || r.status === 'Sudah Dicairkan Finance') return false;
    if (isMaster) {
      return !r.owner_signed_at;
    }
    if (isZoneManager) {
      // Zone Manager only sees items requiring Requester signature; once signed, it disappears from Inbox
      return !r.requester_signed_at;
    }
    if (isManager) {
      // Manager only sees items requiring Manager signature; once signed, it disappears from Manager Inbox
      return (r.status || '').toLowerCase().includes('ttd manager') || (!r.manager_signed_at && r.requester_signed_at);
    }
    if (isGM) {
      // GM only sees items requiring GM signature; once signed, it disappears from GM Inbox
      return (r.status || '').toLowerCase().includes('ttd checker (gm)') || (r.manager_signed_at && !r.gm_signed_at);
    }
    if (isFinance) {
      // Finance sees items requiring Finance Checker signature or ready for disbursement
      return (r.gm_signed_at && !r.finance_checker_signed_at) || (r.owner_signed_at && r.status !== 'Sudah Dicairkan Finance');
    }
    if (isDireksi) {
      // Direksi only sees items requiring Direksi signature; once signed, it disappears from Direksi Inbox
      return (r.status || '').toLowerCase().includes('ttd approval (direksi)') || (r.finance_checker_signed_at && !r.owner_signed_at);
    }
    return false;
  });

  // Map into a single unified list
  const unifiedList = [
    ...pendingComcases.map(c => ({
      itemType: 'COMCASE',
      id: c.id,
      docNumber: c.id || c.comcase_number || 'COM-2026',
      title: c.activity || c.site_id || 'Comcase Darurat',
      subtitle: `${c.project || 'Project'} • Site ${c.site_id || '-'}`,
      requester: c.team_leader || c.submitted_by || 'Supervisor',
      date: c.date || c.created_at || '-',
      amount: c.amount || 0,
      status: c.status || 'Menunggu Review / Approval',
      raw: c
    })),
    ...pendingZoneRequests.map(r => ({
      itemType: 'EXTERNAL',
      id: r.id,
      docNumber: r.request_number || `REQ-EXT-${r.id}`,
      title: r.title || 'Permohonan External',
      subtitle: `${r.zone_name || 'Zone'} • ${r.category || 'Operasional'}`,
      requester: r.requester_name || 'Zone Manager',
      date: r.created_at ? r.created_at.substring(0, 10) : '-',
      amount: r.estimated_cost || 0,
      status: r.status || 'Menunggu TTD Otorisasi',
      raw: r
    }))
  ];

  // Filter & Search unified list
  const filteredList = unifiedList.filter(item => {
    if (filterType !== 'ALL' && item.itemType !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDoc = item.docNumber && item.docNumber.toLowerCase().includes(q);
      const matchTitle = item.title && item.title.toLowerCase().includes(q);
      const matchSub = item.subtitle && item.subtitle.toLowerCase().includes(q);
      const matchReq = item.requester && item.requester.toLowerCase().includes(q);
      return matchDoc || matchTitle || matchSub || matchReq;
    }
    return true;
  });

  const totalPending = unifiedList.length;
  const countComcase = pendingComcases.length;
  const countExternal = pendingZoneRequests.length;

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark mb-0.5" style={{ letterSpacing: '-0.02em' }}>
            Kotak Masuk &amp; Otorisasi Persetujuan
          </h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
            Daftar seluruh berkas permohonan operasional (Comcase &amp; External) yang memerlukan verifikasi, approval, atau tanda tangan digital Anda.
          </p>
        </div>
      </div>

      {/* KPI Cards Ringkas */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-sm-4">
          <div 
            className={`card-stat p-2.5 cursor-pointer ${filterType === 'ALL' ? 'border-primary shadow-xs' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Total Butuh Aksi</span>
                <strong className="fw-black text-dark font-mono" style={{ fontSize: '1.25rem' }}>{totalPending}</strong>
              </div>
              <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2">
                <Inbox size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Hanya tampilkan KPI Comcase jika bukan GM/Direksi */}
        {!isGM && !isDireksi && (
          <div className="col-12 col-sm-4">
            <div 
              className={`card-stat p-2.5 cursor-pointer ${filterType === 'COMCASE' ? 'border-warning shadow-xs' : ''}`}
              onClick={() => setFilterType('COMCASE')}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-warning-emphasis d-block fw-semibold" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Pengajuan Comcase</span>
                  <strong className="fw-black text-warning-emphasis font-mono" style={{ fontSize: '1.25rem' }}>{countComcase}</strong>
                </div>
                <div className="rounded-circle bg-warning bg-opacity-15 text-warning p-2">
                  <FileText size={18} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`col-12 ${isGM || isDireksi ? 'col-sm-8' : 'col-sm-4'}`}>
          <div 
            className={`card-stat p-2.5 cursor-pointer ${filterType === 'EXTERNAL' ? 'border-info shadow-xs' : ''}`}
            onClick={() => setFilterType('EXTERNAL')}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-info d-block fw-semibold" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Dokumen External (PDF)</span>
                <strong className="fw-black text-info font-mono" style={{ fontSize: '1.25rem' }}>{countExternal}</strong>
              </div>
              <div className="rounded-circle bg-info bg-opacity-15 text-info p-2">
                <FileCheck size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card-clean mb-3 p-2.5 bg-white">
        <div className="row g-2 align-items-center justify-content-between">
          <div className="col-12 col-md-6 d-flex align-items-center gap-1.5 overflow-x-auto">
            <button 
              className={`btn btn-sm py-1 px-2.5 fw-semibold ${filterType === 'ALL' ? 'btn-primary' : 'btn-light border text-muted'}`}
              style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              onClick={() => setFilterType('ALL')}
            >
              Semua ({totalPending})
            </button>
            {!isGM && !isDireksi && (
              <button 
                className={`btn btn-sm py-1 px-2.5 fw-semibold ${filterType === 'COMCASE' ? 'btn-warning text-dark' : 'btn-light border text-muted'}`}
                style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                onClick={() => setFilterType('COMCASE')}
              >
                Comcase ({countComcase})
              </button>
            )}
            <button 
              className={`btn btn-sm py-1 px-2.5 fw-semibold ${filterType === 'EXTERNAL' ? 'btn-info text-white' : 'btn-light border text-muted'}`}
              style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              onClick={() => setFilterType('EXTERNAL')}
            >
              External PDF ({countExternal})
            </button>
          </div>

          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Search size={13} />
              </span>
              <input 
                type="text" 
                className="form-control form-control-clean border-start-0 ps-0"
                style={{ fontSize: '0.75rem' }}
                placeholder="Cari No. Berkas, Site, Pemohon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Unified Table */}
      <div className="card-clean overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table-clean mb-0">
            <thead>
              <tr>
                <th style={{ minWidth: '150px' }}>Jenis &amp; No. Berkas</th>
                <th style={{ minWidth: '220px' }}>Perihal / Site &amp; Keterangan</th>
                <th>Pemohon</th>
                <th className="text-end">Nominal Pengajuan</th>
                <th>Status &amp; Kebutuhan</th>
                <th className="text-center" style={{ minWidth: '180px' }}>Aksi Otorisasi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, idx) => {
                const isComcase = item.itemType === 'COMCASE';

                return (
                  <tr key={`${item.itemType}-${item.id || idx}`}>
                    {/* 1. Jenis & No. Berkas */}
                    <td>
                      <div className="d-flex align-items-center gap-1.5 mb-1">
                        {isComcase ? (
                          <span className="badge bg-warning text-dark fw-bold px-1.5 py-0.5 rounded" style={{ fontSize: '0.62rem' }}>
                            COMCASE
                          </span>
                        ) : (
                          <span className="badge bg-primary text-white fw-bold px-1.5 py-0.5 rounded" style={{ fontSize: '0.62rem' }}>
                            EXTERNAL
                          </span>
                        )}
                        <strong className="font-mono text-dark" style={{ fontSize: '0.78rem' }}>
                          {item.docNumber}
                        </strong>
                      </div>
                      <small className="text-muted font-mono d-block" style={{ fontSize: '0.65rem' }}>
                        📅 {item.date}
                      </small>
                    </td>

                    {/* 2. Perihal / Site & Wilayah */}
                    <td>
                      <strong className="text-dark d-block" style={{ fontSize: '0.8rem' }}>
                        {item.title}
                      </strong>
                      <span className="badge-soft badge-soft-slate" style={{ fontSize: '0.68rem' }}>
                        {item.subtitle}
                      </span>
                    </td>

                    {/* 3. Pemohon */}
                    <td>
                      <span className="text-dark fw-semibold d-block" style={{ fontSize: '0.76rem' }}>
                        {item.requester}
                      </span>
                    </td>

                    {/* 4. Nominal Pengajuan */}
                    <td className="text-end">
                      <strong className="font-mono text-primary" style={{ fontSize: '0.82rem' }}>
                        {formatCurrency(item.amount)}
                      </strong>
                    </td>

                    {/* 5. Status & Kebutuhan */}
                    <td>
                      <span className={`badge-soft ${
                        isComcase ? 'badge-soft-warning font-semibold' : 'badge-soft-primary font-semibold'
                      }`} style={{ fontSize: '0.68rem' }}>
                        {item.status}
                      </span>
                    </td>

                    {/* 6. Aksi Otorisasi */}
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1.5 flex-wrap">
                        {/* Tombol Detail */}
                        <button 
                          className="btn btn-sm btn-light border py-1 px-2.5 text-xs font-semibold"
                          onClick={() => {
                            if (isComcase) {
                              onViewComcaseDetail(item.raw);
                            } else {
                              onViewZoneDetail(item.raw);
                            }
                          }}
                        >
                          Detail
                        </button>

                        {/* Tombol Approval, Bayar, atau Tanda Tangan sesuai jenis */}
                        {isComcase ? (
                          isFinance ? (
                            <button 
                              className="btn btn-success text-white btn-sm py-1 px-2.5 text-xs fw-semibold d-flex align-items-center gap-1 shadow-2xs"
                              onClick={() => {
                                if (onOpenComcasePayment) {
                                  onOpenComcasePayment(item.raw);
                                } else {
                                  onViewComcaseDetail(item.raw);
                                }
                              }}
                            >
                              <CheckCircle size={12} />
                              <span>Proses Bayar</span>
                            </button>
                          ) : (
                            <button 
                              className="btn btn-warning text-dark btn-sm py-1 px-2.5 text-xs fw-semibold d-flex align-items-center gap-1 shadow-2xs"
                              onClick={() => onOpenComcaseApproval(item.raw, isZoneManager ? 'zone' : 'manager')}
                            >
                              <CheckCircle size={12} />
                              <span>{isZoneManager ? 'Review & Setujui' : 'Approval Manager'}</span>
                            </button>
                          )
                        ) : (
                          <button 
                            className="btn btn-primary btn-sm py-1 px-2.5 text-xs fw-semibold d-flex align-items-center gap-1 shadow-2xs"
                            onClick={() => onOpenZoneSign(item.raw, currentSigningRole)}
                          >
                            <PenTool size={12} />
                            <span>Tanda Tangani</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <Inbox size={36} className="mx-auto mb-2 opacity-30 text-secondary d-block" />
                    <p className="mb-0 fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                      Tidak Ada Permohonan Pending di Kotak Masuk Anda
                    </p>
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Seluruh berkas operasional dan permohonan telah ditinjau atau ditandatangani.
                    </small>
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
