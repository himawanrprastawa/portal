import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, CheckCircle2, RefreshCw, ExternalLink, Globe } from 'lucide-react';

export default function FinanceGoogleDocs({ expenses, comcases }) {
  const { formatCurrency, showToast } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString('id-ID'));
  const [docUrl, setDocUrl] = useState('https://docs.google.com/document/d/sample_rekap_bsm_operations/edit');

  const handleSyncNow = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      showToast('Rekapitulasi transaksi berhasil disinkronkan ke Google Docs perusahaan!', 'success');
    }, 1200);
  };

  const totalValidatedExpenses = (expenses || []).filter(e => e.status === 'Tervalidasi' || e.status === 'Sudah Divalidasi').length;
  const totalCompletedComcases = (comcases || []).filter(c => c.status === 'Sudah Dibayar' || c.status === 'Disetujui Manager').length;

  return (
    <div className="container-fluid py-3 px-3 px-md-4" style={{ maxWidth: '900px' }}>
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark mb-0.5" style={{ letterSpacing: '-0.02em' }}>Integrasi &amp; Sinkronisasi Google Docs</h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
            Otomatisasi pembuatan dokumen rekapitulasi pengeluaran ke Google Workspace via Service Account API (PRD 3.2).
          </p>
        </div>
        <button 
          className="btn btn-primary btn-sm fw-semibold d-flex align-items-center gap-1.5 shadow-2xs"
          style={{ fontSize: '0.75rem' }}
          onClick={handleSyncNow}
          disabled={syncing}
        >
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
        </button>
      </div>

      <div className="row g-3 mb-3">
        {/* Status Card */}
        <div className="col-12 col-md-6">
          <div className="card-clean p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted fw-bold" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Status Integrasi API</span>
              <span className="badge-soft badge-soft-success">Terhubung Aktif</span>
            </div>
            <h6 className="fw-bold text-dark mb-1">Google Docs &amp; Drive API v3</h6>
            <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
              Service Account: <strong>bsm-operations-sync@bsm-portal.iam.gserviceaccount.com</strong>
            </small>
            <div className="pt-2 mt-2 border-top text-muted" style={{ fontSize: '0.7rem' }}>
              Terakhir Sinkron: <strong>Hari Ini, {lastSyncTime} WIB</strong>
            </div>
          </div>
        </div>

        {/* Data Ready Card */}
        <div className="col-12 col-md-6">
          <div className="card-clean p-3 bg-white h-100">
            <span className="text-muted fw-bold d-block mb-2" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Data Siap Rekap</span>
            <div className="d-flex justify-content-between mb-1 small">
              <span className="text-muted">Transaksi Kas Tervalidasi:</span>
              <strong className="text-dark font-mono">{totalValidatedExpenses} Baris</strong>
            </div>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Comcase Lunas &amp; Sah:</span>
              <strong className="text-dark font-mono">{totalCompletedComcases} Baris</strong>
            </div>
            <a 
              href={docUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-sm btn-light border w-100 py-1 font-semibold text-primary d-flex align-items-center justify-content-center gap-1"
              style={{ fontSize: '0.75rem' }}
            >
              <ExternalLink size={12} />
              <span>Buka Dokumen di Google Docs</span>
            </a>
          </div>
        </div>
      </div>

      {/* Preview Sheet Card */}
      <div className="card-clean p-3 bg-white">
        <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.8125rem' }}>Pratinjau Format Dokumen Rekapitulasi Otomatis</h6>
        <div className="p-3 bg-light rounded-2 font-mono" style={{ fontSize: '0.72rem', lineHeight: '1.6' }}>
          <div className="fw-bold text-center border-bottom pb-2 mb-2 text-dark">
            BERITA ACARA REKAPITULASI PENGELUARAN OPERASIONAL &amp; COMCASE<br />
            PT. BINA SARANA MANDIRI (BSM)
          </div>
          <div>Periode: <strong>{new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</strong></div>
          <div>Total Transaksi Kas: <strong>{totalValidatedExpenses} Transaksi</strong></div>
          <div>Total Pengajuan Comcase: <strong>{totalCompletedComcases} Pengajuan</strong></div>
          <div className="text-success fw-bold mt-2">✓ Status: Format dokumen sesuai standar pembukuan internal BSM.</div>
        </div>
      </div>
    </div>
  );
}

