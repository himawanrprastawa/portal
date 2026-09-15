import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  FileText, 
  FileCheck, 
  CheckCircle2
} from 'lucide-react';

export default function FinancePending({ 
  comcases, 
  zoneRequests, 
  onViewComcaseDetail, 
  onViewZoneDetail, 
  onOpenComcasePayment, 
  onOpenZonePayment 
}) {
  const { formatCurrency } = useAuth();
  const [activeTab, setActiveTab] = useState('comcase'); // 'comcase', 'zone_requests'

  // Filter pending items
  const pendingComcases = (comcases || []).filter(c => 
    (c.status || '').toLowerCase() === 'disetujui manager' || 
    (c.status || '').toLowerCase().includes('disetujui manager')
  );

  const pendingZoneRequests = (zoneRequests || []).filter(r => {
    const s = (r.status || '').toLowerCase();
    if (s.includes('sudah dicairkan') || s.includes('ditolak')) return false;
    return s.includes('disetujui owner') || 
           s.includes('disetujui direksi') || 
           s.includes('disetujui sah direksi') || 
           s.includes('siap pencairan') || 
           s.includes('menunggu pencairan') ||
           Boolean(r.owner_signed_at);
  });

  const totalComcaseAmount = pendingComcases.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const totalZoneAmount = pendingZoneRequests.reduce((sum, r) => sum + (parseFloat(r.estimated_cost) || 0), 0);
  const totalAllPending = pendingComcases.length + pendingZoneRequests.length;

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Header & KPI Summary */}
      <div className="row g-2.5 mb-3">
        <div className="col-12 col-md-4">
          <div className="card-stat">
            <div className="d-flex align-items-center gap-2.5">
              <div className="rounded-2 bg-success bg-opacity-10 text-success p-2">
                <CreditCard size={20} />
              </div>
              <div>
                <span className="text-muted fw-bold d-block" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>Total Siap Dicairkan</span>
                <h5 className="fw-black text-dark mb-0 font-mono" style={{ fontSize: '1.2rem' }}>{totalAllPending} Berkas</h5>
                <span className="font-mono text-success fw-bold" style={{ fontSize: '0.75rem' }}>{formatCurrency(totalComcaseAmount + totalZoneAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <div 
            className={`card-stat cursor-pointer ${activeTab === 'comcase' ? 'border-primary' : ''}`}
            onClick={() => setActiveTab('comcase')}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-center gap-2.5">
              <div className="rounded-2 bg-primary bg-opacity-10 text-primary p-2">
                <FileText size={20} />
              </div>
              <div>
                <span className="text-primary fw-bold d-block" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>Comcase Lapangan</span>
                <h5 className="fw-black text-dark mb-0 font-mono" style={{ fontSize: '1.2rem' }}>{pendingComcases.length} Pengajuan</h5>
                <span className="font-mono text-muted" style={{ fontSize: '0.72rem' }}>{formatCurrency(totalComcaseAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <div 
            className={`card-stat cursor-pointer ${activeTab === 'zone_requests' ? 'border-primary' : ''}`}
            onClick={() => setActiveTab('zone_requests')}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-center gap-2.5">
              <div className="rounded-2 bg-purple bg-opacity-10 p-2" style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)', color: '#7e22ce' }}>
                <FileCheck size={20} />
              </div>
              <div>
                <span className="fw-bold d-block" style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#7e22ce' }}>Permohonan External (PDF)</span>
                <h5 className="fw-black text-dark mb-0 font-mono" style={{ fontSize: '1.2rem' }}>{pendingZoneRequests.length} Surat Sah</h5>
                <span className="font-mono text-muted" style={{ fontSize: '0.72rem' }}>{formatCurrency(totalZoneAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="card-clean overflow-hidden bg-white mb-4">
        {/* Navigation Tabs */}
        <div className="p-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 border-bottom bg-white">
          <div>
            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.85rem' }}>Antrean Pencairan Dana (Disbursement)</h6>
            <small className="text-muted" style={{ fontSize: '0.7rem' }}>
              Dokumen telah disetujui sah dan siap ditransfer oleh Finance.
            </small>
          </div>

          <div className="btn-group btn-group-sm bg-light p-0.5 rounded-2 border">
            <button 
              type="button" 
              className={`btn btn-sm fw-semibold py-1 px-2.5 ${activeTab === 'comcase' ? 'btn-primary' : 'btn-light border-0 text-muted'}`}
              style={{ fontSize: '0.72rem' }}
              onClick={() => setActiveTab('comcase')}
            >
              📌 Comcase Lapangan ({pendingComcases.length})
            </button>
            <button 
              type="button" 
              className={`btn btn-sm fw-semibold py-1 px-2.5 ${activeTab === 'zone_requests' ? 'btn-dark' : 'btn-light border-0 text-muted'}`}
              style={{ fontSize: '0.72rem' }}
              onClick={() => setActiveTab('zone_requests')}
            >
              🌐 Permohonan External PDF ({pendingZoneRequests.length})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3 p-md-4">
          {/* TAB 1: COMCASE PENDING */}
          {activeTab === 'comcase' && (
            <div className="d-flex flex-column gap-2.5">
              {pendingComcases.map(com => (
                <div key={com.id} className="card-clean p-3 bg-white">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start gap-2 pb-2 mb-2 border-bottom">
                    <div>
                      <div className="d-flex align-items-center gap-1.5 flex-wrap mb-1">
                        <strong className="text-dark" style={{ fontSize: '0.85rem' }}>{com.project}</strong>
                        <span className="badge-soft badge-soft-slate font-mono">{com.id}</span>
                        <span className="badge-soft badge-soft-success">✓ Disetujui Manager Ops</span>
                      </div>
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                        Site: <strong className="font-mono">{com.siteId}</strong> &bull; TL: <strong>{com.teamLeader}</strong> &bull; Diajukan: {com.date}
                      </small>
                    </div>
                    <div className="text-sm-end">
                      <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Nominal Transfer:</span>
                      <span className="font-mono fw-black text-primary" style={{ fontSize: '1.15rem' }}>{formatCurrency(com.amount)}</span>
                    </div>
                  </div>

                  <div className="row g-2 small mb-2.5">
                    <div className="col-12 col-md-6">
                      <div className="p-2 bg-light rounded-2 h-100" style={{ fontSize: '0.72rem' }}>
                        <span className="text-muted fw-bold d-block mb-0.5">Rekening Tujuan Transfer:</span>
                        <strong className="text-dark d-block">{com.recipientName}</strong>
                        <span className="font-mono text-muted">{com.bankName} - {com.accountNumber}</span>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="p-2 bg-light rounded-2 h-100" style={{ fontSize: '0.72rem' }}>
                        <span className="text-warning-emphasis fw-bold d-block mb-0.5">Instruksi Manager:</span>
                        <p className="text-dark mb-0 italic">
                          "{com.managerApproval?.notes || 'Disetujui untuk dicairkan oleh Finance.'}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 pt-2 border-top">
                    <button className="btn btn-link btn-sm p-0 text-decoration-none text-muted fw-semibold" style={{ fontSize: '0.72rem' }} onClick={() => onViewComcaseDetail(com)}>
                      🔍 Lihat Lampiran &amp; Rincian &rarr;
                    </button>

                    <button className="btn btn-sm btn-success px-3.5 fw-semibold d-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem' }} onClick={() => onOpenComcasePayment(com)}>
                      <CreditCard size={13} />
                      <span>Konfirmasi Transfer &amp; Pembayaran</span>
                    </button>
                  </div>
                </div>
              ))}

              {pendingComcases.length === 0 && (
                <div className="p-4 bg-light rounded-2 text-center text-muted small">
                  ✓ Tidak ada pembayaran Comcase yang pending saat ini.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ZONE REQUESTS (PDF) PENDING */}
          {activeTab === 'zone_requests' && (
            <div className="d-flex flex-column gap-2.5">
              {pendingZoneRequests.map(req => (
                <div key={req.id} className="card-clean p-3 bg-white">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start gap-2 pb-2 mb-2 border-bottom">
                    <div>
                      <div className="d-flex align-items-center gap-1.5 flex-wrap mb-1">
                        <strong className="text-dark" style={{ fontSize: '0.85rem' }}>{req.title}</strong>
                        <span className="badge-soft badge-soft-slate font-mono">{req.request_number}</span>
                        <span className="badge-soft badge-soft-purple">👑 Disetujui Penuh Owner</span>
                      </div>
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                        Zona: <strong>{req.zone_name}</strong> &bull; Pemohon: <strong>{req.requester_name}</strong>
                      </small>
                    </div>
                    <div className="text-sm-end">
                      <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Estimasi Pencairan:</span>
                      <span className="font-mono fw-black text-primary" style={{ fontSize: '1.15rem' }}>{formatCurrency(req.estimated_cost)}</span>
                    </div>
                  </div>

                  <div className="row g-2 small mb-2.5">
                    <div className="col-12 col-md-4">
                      <div className="p-2 bg-light rounded-2 h-100" style={{ fontSize: '0.72rem' }}>
                        <span className="text-muted fw-bold d-block mb-0.5">Dokumen PDF Terlampir:</span>
                        <span className="text-dark text-truncate d-block font-mono">{req.pdf_filename || 'Dokumen Permohonan.pdf'}</span>
                      </div>
                    </div>

                    <div className="col-12 col-md-4">
                      <div className="p-2 bg-light rounded-2 h-100" style={{ fontSize: '0.72rem' }}>
                        <span className="text-success fw-bold d-block mb-0.5">Otorisasi TTD Sah:</span>
                        <span className="d-block text-success">✓ 1. Manager &bull; ✓ 2. GM &bull; ✓ 3. Owner</span>
                      </div>
                    </div>

                    <div className="col-12 col-md-4">
                      <div className="p-2 bg-light rounded-2 h-100" style={{ fontSize: '0.72rem' }}>
                        <span className="text-muted fw-bold d-block mb-0.5">Disposisi Owner:</span>
                        <p className="text-dark mb-0 italic">
                          "{req.owner_notes || 'Disetujui untuk dicairkan oleh Finance.'}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 pt-2 border-top">
                    <button className="btn btn-link btn-sm p-0 text-decoration-none text-muted fw-semibold" style={{ fontSize: '0.72rem' }} onClick={() => onViewZoneDetail(req)}>
                      🔍 Buka Lembar Permohonan &amp; PDF &rarr;
                    </button>

                    <button className="btn btn-sm btn-success px-3.5 fw-semibold d-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem' }} onClick={() => onOpenZonePayment(req)}>
                      <span>💵</span>
                      <span>Cairkan Dana Permohonan (Finance)</span>
                    </button>
                  </div>
                </div>
              ))}

              {pendingZoneRequests.length === 0 && (
                <div className="p-4 bg-light rounded-2 text-center text-muted small">
                  ✓ Tidak ada surat permohonan external yang menunggu pencairan.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
