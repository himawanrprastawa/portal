import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Users, DollarSign, Eye, X, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';

export default function ComcaseSummary({ comcases, onViewComcaseDetail }) {
  const { formatCurrency } = useAuth();
  const [selectedLeader, setSelectedLeader] = useState(null);

  // Group by Team Leader (supports camelCase and snake_case MySQL columns)
  const summaryByTl = (comcases || []).reduce((acc, c) => {
    const rawTl = c.teamLeader || c.team_leader || c.submittedBy || c.submitted_by || 'Team Leader Lapangan';
    const key = rawTl.trim();
    if (!acc[key]) {
      acc[key] = {
        name: key,
        count: 0,
        totalAmount: 0,
        approvedCount: 0,
        paidCount: 0,
        items: []
      };
    }
    acc[key].count += 1;
    acc[key].totalAmount += (parseFloat(c.amount) || 0);
    const s = (c.status || '').toLowerCase();
    if (s.includes('disetujui') || s.includes('approval manager')) acc[key].approvedCount += 1;
    if (s.includes('dibayar') || s.includes('sudah dibayar')) acc[key].paidCount += 1;
    acc[key].items.push(c);
    return acc;
  }, {});

  const summaryList = Object.values(summaryByTl);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('review zone')) return 'badge-soft badge-soft-primary';
    if (s.includes('approval manager')) return 'badge-soft badge-soft-warning';
    if (s.includes('disetujui')) return 'badge-soft badge-soft-primary';
    if (s.includes('ditolak')) return 'badge-soft badge-soft-danger';
    if (s.includes('dibayar')) return 'badge-soft badge-soft-success';
    return 'badge-soft badge-soft-slate';
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark mb-0.5" style={{ letterSpacing: '-0.02em' }}>List Rekapitulasi Comcase Per Team Leader</h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
            Ringkasan pengajuan dana operasional berdasarkan Team Leader &amp; rincian seluruh berkas request.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="card-clean overflow-hidden bg-white mb-4">
        <div className="table-responsive">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Team Leader / PIC</th>
                <th className="text-center">Total Pengajuan</th>
                <th className="text-center">Disetujui Manager</th>
                <th className="text-center">Lunas Dibayar</th>
                <th className="text-end">Total Akumulasi Nominal (IDR)</th>
                <th className="text-center">Aksi / Rincian</th>
              </tr>
            </thead>
            <tbody>
              {summaryList.map(item => (
                <tr key={item.name}>
                  <td>
                    <div className="d-flex align-items-center gap-2.5">
                      <div 
                        className="rounded-circle bg-primary bg-opacity-10 text-primary font-bold d-flex align-items-center justify-content-center shadow-2xs"
                        style={{ width: '32px', height: '32px', minWidth: '32px', fontSize: '0.78rem' }}
                      >
                        {(item.name || 'T')[0].toUpperCase()}
                      </div>
                      <div>
                        <strong className="text-dark d-block" style={{ fontSize: '0.8rem' }}>{item.name}</strong>
                        <span className="text-muted font-mono" style={{ fontSize: '0.68rem' }}>{item.items.length} transaksi terkait</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-center font-mono fw-bold" style={{ fontSize: '0.8rem' }}>
                    <span className="badge-soft badge-soft-slate">
                      {item.count} Berkas
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="badge-soft badge-soft-warning font-mono">{item.approvedCount}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge-soft badge-soft-success font-mono">{item.paidCount}</span>
                  </td>
                  <td className="text-end font-mono fw-bold text-primary" style={{ fontSize: '0.82rem' }}>
                    {formatCurrency(item.totalAmount)}
                  </td>
                  <td className="text-center">
                    <button 
                      className="btn btn-sm btn-light border py-1 px-2.5 text-xs font-semibold d-inline-flex align-items-center gap-1.5 hover-shadow"
                      onClick={() => setSelectedLeader(item)}
                    >
                      <Eye size={13} className="text-primary" />
                      <span>Lihat Berkas ({item.count})</span>
                    </button>
                  </td>
                </tr>
              ))}

              {summaryList.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted small">
                    Belum ada data pengajuan Comcase lapangan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View Detail Berkas Team Leader */}
      {selectedLeader && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '850px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              {/* Modal Header */}
              <div className="modal-header bg-primary text-white py-3 px-4 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <Users size={20} />
                  <div>
                    <h5 className="modal-title h6 fw-bold mb-0">
                      Daftar Pengajuan Comcase — TL: {selectedLeader.name}
                    </h5>
                    <small className="opacity-90" style={{ fontSize: '0.7rem' }}>
                      Total {selectedLeader.count} Berkas Pengajuan • Akumulasi: {formatCurrency(selectedLeader.totalAmount)}
                    </small>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedLeader(null)}></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-3 p-md-4">
                <div className="card-clean overflow-hidden bg-white border">
                  <div className="table-responsive">
                    <table className="table-clean mb-0">
                      <thead>
                        <tr>
                          <th>No. Comcase &amp; Tgl</th>
                          <th>Project &amp; Site</th>
                          <th>Aktivitas Site</th>
                          <th>Penerima &amp; Rekening</th>
                          <th className="text-end">Nominal</th>
                          <th className="text-center">Status</th>
                          <th className="text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedLeader.items.map((com) => (
                          <tr key={com.id}>
                            <td>
                              <strong className="font-mono text-dark d-block" style={{ fontSize: '0.78rem' }}>{com.id}</strong>
                              <span className="text-muted" style={{ fontSize: '0.68rem' }}>{com.date}</span>
                            </td>
                            <td>
                              <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.75rem' }}>{com.project}</span>
                              <span className="badge-soft badge-soft-slate font-mono" style={{ fontSize: '0.65rem' }}>
                                SITE: {com.siteId || com.site_id || '-'}
                              </span>
                            </td>
                            <td>
                              <p className="text-dark mb-0 small text-truncate" style={{ maxWidth: '160px', fontSize: '0.72rem' }}>
                                {com.activity}
                              </p>
                            </td>
                            <td>
                              <strong className="text-dark d-block" style={{ fontSize: '0.72rem' }}>
                                {com.recipientName || com.recipient_name || '-'}
                              </strong>
                              <span className="text-muted font-mono" style={{ fontSize: '0.68rem' }}>
                                {(com.bankName || com.bank_name || 'BCA')} - {(com.accountNumber || com.account_number || '-')}
                              </span>
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
                              <button 
                                className="btn btn-sm btn-primary py-0.5 px-2 text-xs fw-semibold shadow-2xs"
                                onClick={() => {
                                  setSelectedLeader(null);
                                  if (onViewComcaseDetail) onViewComcaseDetail(com);
                                }}
                              >
                                Buka Berkas
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer bg-light px-4 py-2.5 border-top d-flex justify-content-end">
                <button type="button" className="btn btn-sm btn-secondary px-3.5" onClick={() => setSelectedLeader(null)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

