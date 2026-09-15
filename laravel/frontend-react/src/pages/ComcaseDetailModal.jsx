import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Image as ImageIcon, 
  File, 
  CreditCard,
  X
} from 'lucide-react';

export default function ComcaseDetailModal({ 
  comcase, 
  show, 
  onClose, 
  onOpenApproval, 
  onOpenPayment, 
  onOpenLightbox 
}) {
  const { hasAccess, formatCurrency, currentUser } = useAuth();

  if (!show || !comcase) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-dark text-white py-3 px-4">
            <div className="d-flex align-items-center gap-2">
              <FileText size={20} className="text-warning" />
              <div>
                <h5 className="modal-title h6 fw-bold mb-0">Rincian Pengajuan Comcase</h5>
                <small className="text-secondary font-mono" style={{ fontSize: '0.72rem' }}>
                  {comcase.id} &bull; {comcase.project}
                </small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4 small">
            {/* 4-Tier Pipeline Visualizer */}
            <div className="card border-0 bg-light p-3 rounded-4 mb-4 shadow-xs">
              <span className="text-muted fw-bold d-block mb-2.5 text-xs text-uppercase tracking-wider">
                Alur Otorisasi &amp; Persetujuan Berjenjang (4 Tahapan):
              </span>
              <div className="row g-2 text-center" style={{ fontSize: '0.78rem' }}>
                {/* 1. Supervisor */}
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="p-2.5 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-50 text-success h-100 d-flex flex-column justify-content-center">
                    <span className="fw-bold d-block text-dark">1. Supervisor</span>
                    <span className="badge bg-success text-white my-1 py-0.5 px-2 text-2xs mx-auto">✓ Diajukan</span>
                    <small className="text-muted text-2xs text-truncate">Oleh: <strong>{comcase.submitted_by || comcase.submittedBy || comcase.team_leader || 'Supervisor'}</strong></small>
                  </div>
                </div>

                {/* 2. Zone Manager */}
                <div className="col-12 col-sm-6 col-md-3">
                  <div className={`p-2.5 rounded-3 border h-100 d-flex flex-column justify-content-center ${
                    comcase.zoneManagerApproval?.status === 'Disetujui' || (comcase.status && !comcase.status.includes('Review Zone') && !comcase.status.includes('Ditolak Zone')) ? 'bg-success bg-opacity-10 border-success text-success' :
                    comcase.status === 'Menunggu Review Zone Manager' ? 'bg-white border-primary border-2 shadow-xs text-primary' :
                    comcase.status === 'Ditolak Zone Manager' ? 'bg-danger bg-opacity-10 border-danger text-danger' :
                    'bg-white text-muted opacity-75'
                  }`}>
                    <span className="fw-bold d-block text-dark">2. Zone Manager</span>
                    {comcase.zoneManagerApproval?.status === 'Disetujui' || (comcase.status && !comcase.status.includes('Review Zone') && !comcase.status.includes('Ditolak Zone') && comcase.status !== 'Draft') ? (
                      <>
                        <span className="badge bg-success text-white my-1 py-0.5 px-2 text-2xs mx-auto">✓ Disetujui</span>
                        <small className="text-muted text-2xs text-truncate">Oleh: {comcase.zoneManagerApproval?.approvedBy || comcase.zone_manager_by || 'Zone Manager'}</small>
                      </>
                    ) : comcase.status === 'Menunggu Review Zone Manager' ? (
                      <>
                        <span className="badge bg-primary text-white my-1 py-0.5 px-2 text-2xs mx-auto">⏳ Menunggu Review</span>
                        <small className="text-primary fw-semibold text-2xs">Tahap Verifikasi Zona</small>
                      </>
                    ) : comcase.status === 'Ditolak Zone Manager' ? (
                      <>
                        <span className="badge bg-danger text-white my-1 py-0.5 px-2 text-2xs mx-auto">✕ Ditolak</span>
                        <small className="text-danger text-2xs">Perlu Revisi</small>
                      </>
                    ) : (
                      <span className="badge bg-secondary bg-opacity-25 text-muted my-1 py-0.5 px-2 text-2xs mx-auto">Menunggu Giliran</span>
                    )}
                  </div>
                </div>

                {/* 3. Manager */}
                <div className="col-12 col-sm-6 col-md-3">
                  <div className={`p-2.5 rounded-3 border h-100 d-flex flex-column justify-content-center ${
                    comcase.managerApproval?.status === 'Disetujui' || comcase.status === 'Disetujui Manager' || comcase.status === 'Sudah Dibayar' ? 'bg-success bg-opacity-10 border-success text-success' :
                    (comcase.status && comcase.status.includes('Approval Manager')) ? 'bg-white border-warning border-2 shadow-xs text-dark' :
                    comcase.status === 'Ditolak Manager' ? 'bg-danger bg-opacity-10 border-danger text-danger' :
                    'bg-white text-muted opacity-75'
                  }`}>
                    <span className="fw-bold d-block text-dark">3. Manager</span>
                    {comcase.managerApproval?.status === 'Disetujui' || comcase.status === 'Disetujui Manager' || comcase.status === 'Sudah Dibayar' ? (
                      <>
                        <span className="badge bg-success text-white my-1 py-0.5 px-2 text-2xs mx-auto">✓ Disetujui Sah</span>
                        <small className="text-muted text-2xs text-truncate">Oleh: {comcase.managerApproval?.approvedBy || comcase.manager_approval_by || 'Manager'}</small>
                      </>
                    ) : (comcase.status && comcase.status.includes('Approval Manager')) ? (
                      <>
                        <span className="badge bg-warning text-dark my-1 py-0.5 px-2 text-2xs mx-auto fw-bold">⏳ Menunggu Approval</span>
                        <small className="text-warning-emphasis fw-semibold text-2xs">Tahap Otorisasi Manager</small>
                      </>
                    ) : comcase.status === 'Ditolak Manager' ? (
                      <>
                        <span className="badge bg-danger text-white my-1 py-0.5 px-2 text-2xs mx-auto">✕ Ditolak</span>
                        <small className="text-danger text-2xs">Perlu Revisi</small>
                      </>
                    ) : (
                      <span className="badge bg-secondary bg-opacity-25 text-muted my-1 py-0.5 px-2 text-2xs mx-auto">Menunggu Giliran</span>
                    )}
                  </div>
                </div>

                {/* 4. Finance */}
                <div className="col-12 col-sm-6 col-md-3">
                  <div className={`p-2.5 rounded-3 border h-100 d-flex flex-column justify-content-center ${
                    comcase.status === 'Sudah Dibayar' ? 'bg-success bg-opacity-10 border-success text-success' :
                    comcase.status === 'Disetujui Manager' ? 'bg-white border-info border-2 shadow-xs text-dark' :
                    'bg-white text-muted opacity-75'
                  }`}>
                    <span className="fw-bold d-block text-dark">4. Finance</span>
                    {comcase.status === 'Sudah Dibayar' ? (
                      <>
                        <span className="badge bg-success text-white my-1 py-0.5 px-2 text-2xs mx-auto">✓ Sudah Dicairkan</span>
                        <small className="text-muted text-2xs text-truncate">Oleh: {comcase.finance_payment_by || 'Finance'}</small>
                      </>
                    ) : comcase.status === 'Disetujui Manager' ? (
                      <>
                        <span className="badge bg-info text-white my-1 py-0.5 px-2 text-2xs mx-auto">⏳ Siap Dicairkan</span>
                        <small className="text-info-emphasis fw-semibold text-2xs">Proses Pembayaran</small>
                      </>
                    ) : (
                      <span className="badge bg-secondary bg-opacity-25 text-muted my-1 py-0.5 px-2 text-2xs mx-auto">Menunggu Giliran</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <div className="p-3 bg-white rounded-4 border h-100 shadow-xs">
                  <span className="text-muted fw-bold d-block mb-2 text-xs text-uppercase tracking-wider border-bottom pb-1">Detail Site &amp; Pekerjaan</span>
                  <div className="mb-1.5"><span className="text-muted">No. Pengajuan:</span> <strong className="font-mono text-dark ms-1.5">{comcase.id}</strong></div>
                  <div className="mb-1.5"><span className="text-muted">Tanggal:</span> <strong className="text-dark ms-1.5">{comcase.date}</strong></div>
                  <div className="mb-1.5"><span className="text-muted">Project:</span> <strong className="text-dark ms-1.5">{comcase.project}</strong></div>
                  <div className="mb-1.5"><span className="text-muted">Site ID:</span> <span className="badge bg-light text-dark border font-mono ms-1.5">{comcase.siteId || comcase.site_id || '-'}</span></div>
                  <div><span className="text-muted">Team Leader:</span> <strong className="text-dark ms-1.5">{comcase.teamLeader || comcase.team_leader || '-'}</strong></div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 bg-white rounded-4 border h-100 shadow-xs">
                  <span className="text-muted fw-bold d-block mb-2 text-xs text-uppercase tracking-wider border-bottom pb-1">Rekening &amp; Nominal Pencairan</span>
                  <div className="mb-1.5"><span className="text-muted">Nominal Riil:</span> <span className="font-mono fw-black text-primary fs-6 ms-1.5">{formatCurrency(comcase.amount)}</span></div>
                  <div className="mb-1.5"><span className="text-muted">Penerima Dana:</span> <strong className="text-dark ms-1.5">{comcase.recipientName || comcase.recipient_name || '-'}</strong></div>
                  <div className="mb-1.5"><span className="text-muted">Bank &amp; Rekening:</span> <span className="font-mono fw-bold text-dark ms-1.5">{(comcase.bankName || comcase.bank_name || 'BCA')} - {(comcase.accountNumber || comcase.account_number || '-')}</span></div>
                  <div><span className="text-muted">Diajukan Oleh:</span> <strong className="text-primary ms-1.5">{comcase.submitted_by || comcase.submittedBy || comcase.team_leader || comcase.teamLeader || 'Supervisor'}</strong></div>
                </div>
              </div>

              <div className="col-12">
                <div className="p-3 bg-white rounded-4 border shadow-xs">
                  <span className="text-muted fw-bold d-block mb-2 text-xs text-uppercase tracking-wider border-bottom pb-1">Keperluan &amp; Aktivitas Lapangan</span>
                  <p className="text-dark mb-0">{comcase.activity}</p>
                </div>
              </div>
            </div>

            {/* Notes Section for Zone Manager & Manager */}
            {(comcase.zoneManagerApproval?.notes || comcase.managerApproval?.notes) && (
              <div className="row g-3 mb-3">
                {comcase.zoneManagerApproval?.notes && (
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 border border-primary border-opacity-25">
                      <span className="text-primary fw-bold d-block mb-1 text-xs">🌐 CATATAN ZONE MANAGER</span>
                      <p className="text-dark small mb-1 italic">"{comcase.zoneManagerApproval.notes}"</p>
                      <small className="text-muted d-block">Oleh: {comcase.zoneManagerApproval.approvedBy} ({comcase.zoneManagerApproval.approvedAt})</small>
                    </div>
                  </div>
                )}

                {comcase.managerApproval?.notes && (
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 border border-warning border-opacity-25">
                      <span className="text-warning-emphasis fw-bold d-block mb-1 text-xs">🛡️ CATATAN APPROVAL MANAGER</span>
                      <p className="text-dark small mb-1 italic">"{comcase.managerApproval.notes}"</p>
                      <small className="text-muted d-block">Oleh: {comcase.managerApproval.approvedBy} ({comcase.managerApproval.approvedAt})</small>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attachments Section */}
            <div className="card border-0 bg-light p-3 rounded-3">
              <span className="text-muted fw-bold d-block mb-2 text-xs">DOKUMEN &amp; BERKAS BUKTI LAPANGAN:</span>
              <div className="d-flex flex-wrap gap-2">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5"
                  onClick={() => onOpenLightbox(comcase.docFotoPreview || 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800', 'Foto Site & Lapangan', comcase.siteId)}
                >
                  <ImageIcon size={14} />
                  <span>Foto Bukti Lapangan</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-info d-flex align-items-center gap-1.5"
                  onClick={() => alert(`Berkas Berita Acara:\n${comcase.docBeritaAcara || 'Berita_Acara_Comcase.pdf'}`)}
                >
                  <File size={14} />
                  <span>Berita Acara (BA)</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-success d-flex align-items-center gap-1.5"
                  onClick={() => alert(`Berkas Kwitansi / Nota:\n${comcase.docKwitansi || 'Kwitansi_Biaya_Site.pdf'}`)}
                >
                  <File size={14} />
                  <span>Nota / Kwitansi</span>
                </button>

                {comcase.docPatwal && (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5"
                    onClick={() => alert(`Berkas Patwal:\n${comcase.docPatwal}`)}
                  >
                    <File size={14} />
                    <span>Dokumen Patwal</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-light py-2 px-4 d-flex justify-content-between">
            <button type="button" className="btn btn-secondary btn-sm px-3" onClick={onClose}>
              Tutup
            </button>

            <div className="d-flex gap-2">
              {/* Zone Manager Review Action */}
              {(hasAccess('ZoneManager') || (currentUser?.role || '').toLowerCase().includes('zone')) && comcase.status === 'Menunggu Review Zone Manager' && (
                <>
                  <button type="button" className="btn btn-danger btn-sm px-3 fw-bold" onClick={() => { onClose(); onOpenApproval(comcase, 'zone', 'reject'); }}>
                    ✕ Tolak
                  </button>
                  <button type="button" className="btn btn-primary btn-sm px-4 fw-bold shadow-sm" onClick={() => { onClose(); onOpenApproval(comcase, 'zone', 'approve'); }}>
                    ✓ Setujui &amp; Teruskan ke Manager
                  </button>
                </>
              )}

              {/* Manager Approval Action (Strictly Manager Tier only, not Zone Manager) */}
              {hasAccess('Manager') && !((currentUser?.role || '').toLowerCase().includes('zone')) && (comcase.status === 'Menunggu Approval Manager Operasional' || comcase.status === 'Menunggu Approval Manager') && (
                <>
                  <button type="button" className="btn btn-danger btn-sm px-3 fw-bold" onClick={() => { onClose(); onOpenApproval(comcase, 'manager', 'reject'); }}>
                    ✕ Tolak
                  </button>
                  <button type="button" className="btn btn-info btn-sm px-4 fw-bold text-white shadow-sm" onClick={() => { onClose(); onOpenApproval(comcase, 'manager', 'approve'); }}>
                    ✓ Setujui ke Finance
                  </button>
                </>
              )}

              {/* Finance Payout Action */}
              {hasAccess('Finance') && comcase.status === 'Disetujui Manager' && (
                <button type="button" className="btn btn-success btn-sm px-4 fw-bold shadow-sm d-flex align-items-center gap-1.5" onClick={() => { onClose(); onOpenPayment(comcase); }}>
                  <CreditCard size={16} />
                  <span>Proses Bayar Sekarang</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

