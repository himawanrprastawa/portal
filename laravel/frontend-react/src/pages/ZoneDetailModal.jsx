import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileCheck, 
  PenTool, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  Briefcase,
  DollarSign, 
  Crown,
  AlertCircle,
  Printer,
  Eye,
  X
} from 'lucide-react';

export default function ZoneDetailModal({ 
  request, 
  show, 
  onClose, 
  onOpenSign, 
  onOpenDisburse 
}) {
  const { hasAccess, formatCurrency, currentUser } = useAuth();
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  if (!show || !request) return null;

  const isMaster = currentUser?.role === 'Master' || (currentUser?.role || '').toLowerCase().includes('master');
  const userRole = (currentUser?.role || '').toLowerCase();
  const isFinance = userRole.includes('finance') || isMaster;

  // Signature Permissions based on 5-Tier Approval Flow:
  // 1. Requester (Zone Mgr)
  const canSignRequester = (userRole.includes('zone') || isMaster) && !request.requester_signature;
  // 2. Manager (Manager Ops)
  const canSignManager = (userRole === 'manager' || userRole.includes('manager ops') || isMaster) && !request.manager_signed_at;
  // 3. Checker 1 (GM)
  const canSignGm = (userRole.includes('general manager') || userRole === 'gm' || isMaster) && request.manager_signed_at && !request.gm_signed_at;
  // 4. Checker 2 (Finance)
  const canSignFinanceChecker = (userRole.includes('finance') || isMaster) && request.gm_signed_at && !request.finance_checker_signed_at;
  // 5. Approval (Direksi / Owner)
  const canSignOwner = (userRole.includes('direksi') || userRole.includes('owner') || isMaster) && request.finance_checker_signed_at && !request.owner_signed_at;
  
  // Disbursement permission by Finance after Direksi has fully approved
  const canDisburse = (userRole.includes('finance') || isMaster) && request.owner_signed_at && !request.finance_paid_at;

  const handlePrintSignedDocument = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Izinkan popup browser untuk mengunduh atau mencetak dokumen PDF resmi.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Dokumen Permohonan &amp; Lembar Otorisasi - ${request.request_number || 'REQ-EXT'}</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; font-size: 8.5pt; color: #0f172a; line-height: 1.25; margin: 0; padding: 0; }
          
          /* Single Page Wrapper: Pas 1 Halaman Utuh */
          .single-page-wrapper { width: 100%; display: flex; flex-direction: column; padding: 4px; }
          
          /* Header Banner Terpadu */
          .doc-header-banner { background: #f8fafc; border: 1.5px solid #0f172a; border-radius: 4px; padding: 5px 10px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center; }
          .doc-header-banner .brand h3 { margin: 0 0 1px 0; font-size: 10.5pt; color: #0f172a; letter-spacing: 0.5px; }
          .doc-header-banner .brand p { margin: 0; font-size: 7pt; color: #475569; }
          .doc-header-banner .meta { text-align: right; }
          .doc-header-banner .meta .num { font-size: 8.5pt; font-weight: bold; font-family: monospace; color: #0f172a; }
          .doc-header-banner .meta .cost { font-size: 9.5pt; font-weight: 900; color: #0284c7; font-family: monospace; }
          
          /* Container Dokumen PDF Asli: Scale 100% */
          .pdf-render-container { width: 100%; display: flex; flex-direction: column; align-items: center; margin-bottom: 5px; }
          .pdf-render-container canvas { width: 100% !important; height: auto !important; max-width: 100%; object-fit: contain; border: 1px solid #cbd5e1; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          .pdf-fallback-card { padding: 25px 20px; text-align: center; color: #475569; width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; }

          /* Lembar Tanda Tangan Saja (5 Tahapan) */
          .sig-section { width: 100%; margin-top: 2px; }
          .sig-header-title { font-weight: bold; font-size: 7.8pt; text-transform: uppercase; margin-bottom: 3px; border-bottom: 1.5px solid #0f172a; padding-bottom: 2px; display: flex; justify-content: space-between; align-items: center; }
          .sig-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          .sig-table th, .sig-table td { border: 1px solid #94a3b8; padding: 3px 2px; text-align: center; vertical-align: top; font-size: 6.8pt; }
          .sig-table th { background: #f1f5f9; font-weight: bold; color: #0f172a; height: 18px; }
          .sig-box { height: 48px; display: flex; align-items: center; justify-content: center; }
          .sig-box img { max-height: 44px; max-width: 95%; object-fit: contain; }
          .sig-name { font-weight: bold; font-size: 7.2pt; margin-top: 1px; color: #0f172a; }
          .sig-date { font-size: 5.8pt; color: #64748b; font-family: monospace; }
          .valid-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 0.5px 3px; border-radius: 2px; font-size: 5.5pt; font-weight: bold; margin-top: 1px; }
          
          /* Footer Keabsahan */
          .footer-note { font-size: 6.5pt; color: #94a3b8; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 2px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="single-page-wrapper">
          <!-- HEADER KOP & SPESIFIKASI DOKUMEN RESMI PT BSM -->
          <div class="doc-header-banner">
            <div class="brand">
              <h3>PT. BINTANG SINAR MULIA &bull; SURAT PERMOHONAN EXTERNAL</h3>
              <p>Perihal: <strong>${request.title || '-'}</strong> &bull; Wilayah: <strong>${request.zone_name || 'Zone 1, Jabodetabek'}</strong> &bull; Kategori: <strong>${request.category || 'Pembayaran Tim External'}</strong></p>
            </div>
            <div class="meta">
              <div class="num">No. ${request.request_number || 'REQ-EXT'}</div>
              <div class="cost">${formatCurrency(request.estimated_cost || 0)}</div>
            </div>
          </div>

          <!-- DOKUMEN ASLI / INVOICE FULL SCALE 100% DENGAN FOOTER DIPOTONG 25% -->
          <div id="pdf-render-container" class="pdf-render-container">
            ${request.pdf_url ? `
              <div id="pdf-loading-indicator" style="padding: 30px; text-align: center; color: #64748b;">
                <p>Memuat dan merender lembar PDF lampiran (Scale 100% &bull; Crop Footer 25%)...</p>
              </div>
            ` : `
              <div class="pdf-fallback-card">
                <div style="font-size: 22pt; margin-bottom: 4px;">📄</div>
                <h4 style="margin: 0 0 4px 0; color: #0f172a;">${request.pdf_filename || 'Dokumen_Permohonan_External.pdf'}</h4>
                <p style="font-size: 8pt; margin: 0;">Diajukan oleh: <strong>${request.requester_name || 'Zone Manager'}</strong> pada <strong>${request.created_at || '-'}</strong></p>
              </div>
            `}
          </div>

          <!-- LEMBAR 5 TANDA TANGAN DIGITAL SAH (TERTERA PADA HALAMAN YANG SAMA) -->
          <div class="sig-section">
            <div class="sig-header-title">
              <span>LEMBAR PENGESAHAN OTORISASI DIGITAL 5 TAHAPAN</span>
              <span style="font-weight: normal; font-size: 6.8pt; color: #166534;">✓ Sertifikat Digital Sah Berlaku Hukum</span>
            </div>
            
            <table class="sig-table">
              <thead>
                <tr>
                  <th>1. Requester (Zone)</th>
                  <th>2. Checker (Manager)</th>
                  <th>3. Checker 1 (GM)</th>
                  <th>4. Checker 2 (Finance)</th>
                  <th>5. Approval (Direksi / Owner)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="sig-box">
                      ${request.requester_signature ? `<img src="${request.requester_signature}" alt="TTD Requester" />` : '<span style="color:#94a3b8;">(Belum TTD)</span>'}
                    </div>
                    <div class="sig-name">${request.requester_name || 'Zone Manager'}</div>
                    <div class="sig-date">${request.requester_signed_at || request.created_at || '-'}</div>
                    ${request.requester_signed_at ? '<div class="valid-badge">✓ SAH</div>' : ''}
                  </td>
                  <td>
                    <div class="sig-box">
                      ${request.manager_signature ? `<img src="${request.manager_signature}" alt="TTD Manager" />` : '<span style="color:#94a3b8;">(Belum TTD)</span>'}
                    </div>
                    <div class="sig-name">${request.manager_name || 'pandu (Manager)'}</div>
                    <div class="sig-date">${request.manager_signed_at || '-'}</div>
                    ${request.manager_signed_at ? '<div class="valid-badge">✓ SAH</div>' : ''}
                  </td>
                  <td>
                    <div class="sig-box">
                      ${request.gm_signature ? `<img src="${request.gm_signature}" alt="TTD GM" />` : '<span style="color:#94a3b8;">(Belum TTD)</span>'}
                    </div>
                    <div class="sig-name">${request.gm_name || 'General Manager Ops'}</div>
                    <div class="sig-date">${request.gm_signed_at || '-'}</div>
                    ${request.gm_signed_at ? '<div class="valid-badge">✓ SAH</div>' : ''}
                  </td>
                  <td>
                    <div class="sig-box">
                      ${request.finance_checker_signature ? `<img src="${request.finance_checker_signature}" alt="TTD Finance" />` : '<span style="color:#94a3b8;">(Belum TTD)</span>'}
                    </div>
                    <div class="sig-name">${request.finance_checker_name || 'himawan (Finance)'}</div>
                    <div class="sig-date">${request.finance_checker_signed_at || '-'}</div>
                    ${request.finance_checker_signed_at ? '<div class="valid-badge">✓ SAH VERIFIKASI</div>' : ''}
                  </td>
                  <td>
                    <div class="sig-box">
                      ${request.owner_signature ? `<img src="${request.owner_signature}" alt="TTD Owner" />` : '<span style="color:#94a3b8;">(Belum TTD)</span>'}
                    </div>
                    <div class="sig-name">${request.owner_name || 'Direksi Utama / Owner'}</div>
                    <div class="sig-date">${request.owner_signed_at || '-'}</div>
                    ${request.owner_signed_at ? '<div class="valid-badge">👑 APPROVAL FINAL</div>' : ''}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="footer-note">
              <span>BSM Portal Digital Validation &bull; Kode: BSM-${request.id || 'EXT'}-${Date.now()}</span>
              <span>Dokumen Sah 1 Halaman (Scale 100% &bull; Crop Footer 25%)</span>
            </div>
          </div>
        </div>

        <script>
          const pdfDataUrl = ${JSON.stringify(request.pdf_url || '')};
          
          async function initRenderAndPrint() {
            const container = document.getElementById('pdf-render-container');
            if (typeof pdfjsLib !== 'undefined' && pdfDataUrl) {
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              try {
                const loadingTask = pdfjsLib.getDocument(pdfDataUrl);
                const pdfDoc = await loadingTask.promise;
                
                const page1 = await pdfDoc.getPage(1);
                const initialViewport = page1.getViewport({ scale: 1 });
                const isLandscape = initialViewport.width > initialViewport.height;

                const style = document.createElement('style');
                if (isLandscape) {
                  style.innerHTML = '@page { size: A4 landscape; margin: 4mm 6mm; } .sig-box { height: 46px; } .sig-box img { max-height: 42px; }';
                } else {
                  style.innerHTML = '@page { size: A4 portrait; margin: 4mm 6mm; } .sig-box { height: 44px; } .sig-box img { max-height: 40px; }';
                }
                document.head.appendChild(style);

                container.innerHTML = '';
                for (let pNum = 1; pNum <= pdfDoc.numPages; pNum++) {
                  const page = await pdfDoc.getPage(pNum);
                  const viewport = page.getViewport({ scale: 2.0 });
                  
                  // Render halaman penuh ke canvas sementara
                  const tempCanvas = document.createElement('canvas');
                  tempCanvas.width = viewport.width;
                  tempCanvas.height = viewport.height;
                  const tempCtx = tempCanvas.getContext('2d');
                  await page.render({ canvasContext: tempCtx, viewport: viewport }).promise;

                  // Potong bagian bawah (footer) sebanyak 25%, tampilkan 75% bagian atas
                  const cropHeight = Math.floor(viewport.height * 0.75);
                  const canvas = document.createElement('canvas');
                  canvas.width = viewport.width;
                  canvas.height = cropHeight;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(tempCanvas, 0, 0, viewport.width, cropHeight, 0, 0, viewport.width, cropHeight);

                  canvas.style.width = '100%';
                  canvas.style.height = 'auto';
                  canvas.style.display = 'block';
                  canvas.style.marginBottom = '4px';
                  canvas.style.borderRadius = '3px';
                  canvas.style.border = '1px solid #cbd5e1';
                  canvas.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';

                  container.appendChild(canvas);
                }
              } catch (err) {
                console.warn('PDF.js render fallback:', err);
                container.innerHTML = '<iframe src="' + pdfDataUrl + '#view=FitH&toolbar=0&navpanes=0" style="width:100%;height:450px;border:none;"></iframe>';
              }
            } else if (pdfDataUrl) {
              container.innerHTML = '<iframe src="' + pdfDataUrl + '#view=FitH&toolbar=0&navpanes=0" style="width:100%;height:450px;border:none;"></iframe>';
            }

            setTimeout(function() {
              window.print();
            }, 500);
          }

          window.onload = initRenderAndPrint;
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
          {/* Header */}
          <div className="modal-header bg-dark text-white py-2.5 px-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle bg-primary bg-opacity-25 text-primary p-1.5">
                <FileCheck size={18} />
              </div>
              <div>
                <h5 className="modal-title h6 fw-bold mb-0 text-white" style={{ fontSize: '0.92rem' }}>
                  Lembar Permohonan External &amp; Otorisasi Sah
                </h5>
                <small className="text-secondary font-mono" style={{ fontSize: '0.7rem' }}>
                  {request.request_number} &bull; {request.zone_name}
                </small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {/* Tombol Unduh/Cetak PDF Ber-TTD Sah untuk Finance & Master */}
              {isFinance && (
                <button 
                  type="button" 
                  className="btn btn-warning btn-sm py-1 px-3 fw-bold d-flex align-items-center gap-1.5 shadow-2xs text-dark"
                  style={{ fontSize: '0.75rem' }}
                  onClick={handlePrintSignedDocument}
                  title="Unduh / Cetak Surat Permohonan Lengkap dengan 5 Tanda Tangan Sah"
                >
                  <Download size={14} />
                  <span>Unduh PDF Ber-TTD Sah</span>
                </button>
              )}
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-3 p-md-4 small">
            {/* Top Cards: Data Permohonan & Anggaran */}
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded-3 border h-100">
                  <span className="text-muted fw-bold d-block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                    DATA PERMOHONAN EXTERNAL
                  </span>
                  <div className="mb-1 d-flex justify-content-between">
                    <span className="text-muted">Nomor Surat:</span>
                    <strong className="font-mono text-dark">{request.request_number}</strong>
                  </div>
                  <div className="mb-1 d-flex justify-content-between">
                    <span className="text-muted">Perihal:</span>
                    <strong className="text-dark text-end" style={{ maxWidth: '65%' }}>{request.title}</strong>
                  </div>
                  <div className="mb-1 d-flex justify-content-between">
                    <span className="text-muted">Kategori:</span>
                    <span className="badge-soft badge-soft-slate">{request.category || 'Operasional Khusus'}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Wilayah / Zona:</span>
                    <span className="badge-soft badge-soft-primary">{request.zone_name}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded-3 border h-100">
                  <span className="text-muted fw-bold d-block mb-1.5" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                    ANGGARAN &amp; STATUS DISPOSISI
                  </span>
                  <div className="mb-1 d-flex justify-content-between align-items-center">
                    <span className="text-muted">Estimasi Biaya:</span>
                    <span className="font-mono fw-black text-primary fs-6">{formatCurrency(request.estimated_cost)}</span>
                  </div>
                  <div className="mb-1 d-flex justify-content-between">
                    <span className="text-muted">Pemohon (Requester):</span>
                    <strong className="text-dark">{request.requester_name}</strong>
                  </div>
                  <div className="mb-1 d-flex justify-content-between">
                    <span className="text-muted">Tanggal Pengajuan:</span>
                    <span className="text-dark font-mono">{request.created_at ? request.created_at.substring(0, 19) : '-'}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Status Otorisasi:</span>
                    <span className="badge-soft badge-soft-warning font-semibold">{request.status}</span>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              {request.description && (
                <div className="col-12">
                  <div className="p-2.5 bg-white rounded-3 border">
                    <span className="text-muted fw-bold d-block mb-1" style={{ fontSize: '0.68rem' }}>DESKRIPSI KEBUTUHAN:</span>
                    <p className="text-dark mb-0" style={{ fontSize: '0.78rem' }}>{request.description}</p>
                  </div>
                </div>
              )}

              {/* PDF Document Attachment Link */}
              <div className="col-12">
                <div className="p-2.5 bg-light rounded-3 border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded p-1.5 bg-danger bg-opacity-10 text-danger">
                      <FileText size={20} />
                    </div>
                    <div>
                      <strong className="d-block text-dark" style={{ fontSize: '0.78rem' }}>
                        {request.pdf_filename || 'Dokumen_Permohonan_External.pdf'}
                      </strong>
                      <small className="text-muted" style={{ fontSize: '0.68rem' }}>Berkas PDF Surat Resmi Lampiran Zone Manager</small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* Tombol Pratinjau Dokumen PDF Lampiran */}
                    <button 
                      type="button" 
                      className="btn btn-sm btn-primary py-1 px-3 d-flex align-items-center gap-1.5 font-semibold shadow-2xs" 
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setShowPdfPreview(true)}
                    >
                      <Eye size={13} />
                      <span>Pratinjau PDF Lampiran</span>
                    </button>

                    {/* Tombol Cetak / Unduh Dokumen PDF Ber-TTD Sah */}
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-dark py-1 px-3 d-flex align-items-center gap-1.5 font-semibold" 
                      style={{ fontSize: '0.75rem' }}
                      onClick={handlePrintSignedDocument}
                    >
                      <Printer size={13} />
                      <span>Cetak Lembar TTD (PDF)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Tier Multi-Signature Certificate Section */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.82rem' }}>
                  Lembar Tanda Tangan &amp; Otorisasi Sah (5 Tahapan):
                </h6>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                  Sertifikat TTD Elektronik Berlaku Sah
                </small>
              </div>

              <div className="row g-2">
                {/* 1. Requester (Zone Manager) */}
                <div className="col-12 col-sm-6 col-md-4 col-xl" style={{ minWidth: '19%' }}>
                  <div className={`card border shadow-2xs rounded-3 overflow-hidden h-100 d-flex flex-column ${
                    request.requester_signed_at || request.requester_signature ? 'border-success' : 'border-dashed bg-light'
                  }`}>
                    <div className="p-2 bg-light border-bottom d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-1 text-truncate">
                        <UserCheck size={12} className="text-primary flex-shrink-0" />
                        <span className="fw-bold text-dark font-sans text-truncate" style={{ fontSize: '0.7rem' }}>
                          1. Requester (Zone)
                        </span>
                      </div>
                      {request.requester_signed_at || request.requester_signature ? (
                        <span className="badge-soft badge-soft-success py-0.5 px-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>✓ Sah</span>
                      ) : (
                        <span className="badge-soft badge-soft-slate py-0.5 px-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>⏳ Tunggu</span>
                      )}
                    </div>

                    <div className="d-flex align-items-center justify-content-center p-2 bg-white flex-grow-1" style={{ minHeight: '65px' }}>
                      {request.requester_signature ? (
                        <img src={request.requester_signature} alt="TTD Requester" style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center text-muted opacity-50 py-1">
                          <PenTool size={14} className="mb-0.5" />
                          <span style={{ fontSize: '0.62rem' }}>Diajukan</span>
                        </div>
                      )}
                    </div>

                    <div className="p-2 bg-light bg-opacity-75 border-top mt-auto">
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.72rem' }} title={request.requester_name}>
                        {request.requester_name || '-'}
                      </div>
                      <div className="text-muted font-mono" style={{ fontSize: '0.62rem' }}>
                        {request.requester_signed_at ? `🕒 ${request.requester_signed_at.substring(0, 19)}` : (request.created_at ? `🕒 ${request.created_at.substring(0, 19)}` : '-')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Checker (Manager) */}
                <div className="col-12 col-sm-6 col-md-4 col-xl" style={{ minWidth: '19%' }}>
                  <div className={`card border shadow-2xs rounded-3 overflow-hidden h-100 d-flex flex-column ${
                    request.manager_signed_at ? 'border-success' : 'border-dashed bg-light'
                  }`}>
                    <div className="p-2 bg-light border-bottom d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-1 text-truncate">
                        <Briefcase size={12} className="text-primary flex-shrink-0" />
                        <span className="fw-bold text-dark font-sans text-truncate" style={{ fontSize: '0.7rem' }}>
                          2. Checker (Manager)
                        </span>
                      </div>
                      {request.manager_signed_at ? (
                        <span className="badge-soft badge-soft-success py-0.5 px-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>✓ Sah</span>
                      ) : (
                        <span className="badge-soft badge-soft-slate py-0.5 px-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>⏳ Tunggu</span>
                      )}
                    </div>

                    <div className="d-flex align-items-center justify-content-center p-2 bg-white flex-grow-1" style={{ minHeight: '65px' }}>
                      {request.manager_signature ? (
                        <img src={request.manager_signature} alt="TTD Manager" style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center text-muted opacity-50 py-1">
                          <PenTool size={14} className="mb-0.5" />
                          <span style={{ fontSize: '0.62rem' }}>Menunggu TTD Mgr</span>
                        </div>
                      )}
                    </div>

                    <div className="p-2 bg-light bg-opacity-75 border-top mt-auto">
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.72rem' }} title={request.manager_name}>
                        {request.manager_name || 'Manager (Checker)'}
                      </div>
                      <div className="text-muted font-mono" style={{ fontSize: '0.62rem' }}>
                        {request.manager_signed_at ? `🕒 ${request.manager_signed_at.substring(0, 19)}` : 'Belum diverifikasi'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Checker 1 (General Manager) */}
                <div className="col-12 col-sm-6 col-md-4 col-xl" style={{ minWidth: '19%' }}>
                  <div className={`card border shadow-2xs rounded-3 overflow-hidden h-100 d-flex flex-column ${
                    request.gm_signed_at ? 'border-success' : 'border-dashed bg-light'
                  }`}>
                    <div className="p-2 bg-light border-bottom d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-1 text-truncate">
                        <ShieldCheck size={12} className="text-primary flex-shrink-0" />
                        <span className="fw-bold text-dark font-sans text-truncate" style={{ fontSize: '0.7rem' }}>
                          3. Checker (GM)
                        </span>
                      </div>
                      {request.gm_signed_at ? (
                        <span className="badge-soft badge-soft-success py-0.5 px-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>✓ Sah</span>
                      ) : (
                        <span className="badge-soft badge-soft-slate py-0.5 px-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>⏳ Tunggu</span>
                      )}
                    </div>

                    <div className="d-flex align-items-center justify-content-center p-2 bg-white flex-grow-1" style={{ minHeight: '65px' }}>
                      {request.gm_signature ? (
                        <img src={request.gm_signature} alt="TTD GM" style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center text-muted opacity-50 py-1">
                          <PenTool size={14} className="mb-0.5" />
                          <span style={{ fontSize: '0.62rem' }}>Menunggu TTD GM</span>
                        </div>
                      )}
                    </div>

                    <div className="p-2 bg-light bg-opacity-75 border-top mt-auto">
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.72rem' }} title={request.gm_name}>
                        {request.gm_name || 'General Manager'}
                      </div>
                      <div className="text-muted font-mono" style={{ fontSize: '0.62rem' }}>
                        {request.gm_signed_at ? `🕒 ${request.gm_signed_at.substring(0, 19)}` : 'Belum diverifikasi'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Checker 2 (Finance) */}
                <div className="col-12 col-sm-6 col-md-4 col-xl" style={{ minWidth: '19%' }}>
                  <div className={`card border shadow-2xs rounded-3 overflow-hidden h-100 d-flex flex-column ${
                    request.finance_checker_signed_at ? 'border-success' : 'border-dashed bg-light'
                  }`}>
                    <div className="p-2 bg-light border-bottom d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-1 text-truncate">
                        <DollarSign size={12} className="text-success flex-shrink-0" />
                        <span className="fw-bold text-dark font-sans text-truncate" style={{ fontSize: '0.7rem' }}>
                          4. Checker (Fin)
                        </span>
                      </div>
                      {request.finance_checker_signed_at ? (
                        <span className="badge-soft badge-soft-success py-0.5 px-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>✓ Sah</span>
                      ) : (
                        <span className="badge-soft badge-soft-slate py-0.5 px-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>⏳ Tunggu</span>
                      )}
                    </div>

                    <div className="d-flex align-items-center justify-content-center p-2 bg-white flex-grow-1" style={{ minHeight: '65px' }}>
                      {request.finance_checker_signature ? (
                        <img src={request.finance_checker_signature} alt="TTD Finance" style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center text-muted opacity-50 py-1">
                          <PenTool size={14} className="mb-0.5" />
                          <span style={{ fontSize: '0.62rem' }}>Menunggu TTD Finance</span>
                        </div>
                      )}
                    </div>

                    <div className="p-2 bg-light bg-opacity-75 border-top mt-auto">
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.72rem' }} title={request.finance_checker_name}>
                        {request.finance_checker_name || 'Checker Finance'}
                      </div>
                      <div className="text-muted font-mono" style={{ fontSize: '0.62rem' }}>
                        {request.finance_checker_signed_at ? `🕒 ${request.finance_checker_signed_at.substring(0, 19)}` : 'Belum diverifikasi'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Approval (Direksi / Owner) */}
                <div className="col-12 col-sm-6 col-md-4 col-xl" style={{ minWidth: '19%' }}>
                  <div className={`card border shadow-2xs rounded-3 overflow-hidden h-100 d-flex flex-column ${
                    request.owner_signed_at ? 'border-success' : 'border-dashed bg-light'
                  }`}>
                    <div className="p-2 bg-light border-bottom d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-1 text-truncate">
                        <Crown size={12} style={{ color: '#9333ea' }} className="flex-shrink-0" />
                        <span className="fw-bold font-sans text-truncate" style={{ fontSize: '0.7rem', color: '#9333ea' }}>
                          5. Approval (Dir)
                        </span>
                      </div>
                      {request.owner_signed_at ? (
                        <span className="badge-soft badge-soft-success py-0.5 px-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>✓ Sah</span>
                      ) : (
                        <span className="badge-soft badge-soft-slate py-0.5 px-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>⏳ Tunggu</span>
                      )}
                    </div>

                    <div className="d-flex align-items-center justify-content-center p-2 bg-white flex-grow-1" style={{ minHeight: '65px' }}>
                      {request.owner_signature ? (
                        <img src={request.owner_signature} alt="TTD Direksi" style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center text-muted opacity-50 py-1">
                          <PenTool size={14} className="mb-0.5" />
                          <span style={{ fontSize: '0.62rem' }}>Menunggu TTD Direksi</span>
                        </div>
                      )}
                    </div>

                    <div className="p-2 bg-light bg-opacity-75 border-top mt-auto">
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.72rem' }} title={request.owner_name}>
                        {request.owner_name || 'Direksi / Owner'}
                      </div>
                      <div className="text-muted font-mono" style={{ fontSize: '0.62rem' }}>
                        {request.owner_signed_at ? `🕒 ${request.owner_signed_at.substring(0, 19)}` : 'Belum disetujui'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Finance Payout Status if already processed */}
            {request.finance_paid_at && (
              <div className="p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25 mt-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-success fw-bold text-xs uppercase">✓ SUDAH DICAIRKAN OLEH FINANCE</span>
                  <span className="font-mono fw-black text-success fs-6">{formatCurrency(request.finance_amount || request.estimated_cost)}</span>
                </div>
                <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                  Dicairkan oleh: <strong>{request.finance_paid_by}</strong> pada <strong>{request.finance_paid_at}</strong>
                </small>
                {request.finance_notes && (
                  <small className="text-muted d-block mt-0.5 italic" style={{ fontSize: '0.7rem' }}>
                    Catatan Finance: "{request.finance_notes}"
                  </small>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-light py-2 px-4 d-flex justify-content-between">
            <button type="button" className="btn btn-secondary btn-sm px-3" onClick={onClose}>
              Tutup
            </button>

            <div className="d-flex gap-2 flex-wrap">
              {/* Requester Sign Button (Zone Manager) */}
              {canSignRequester && (
                <button type="button" className="btn btn-primary btn-sm px-3 fw-bold shadow-sm d-flex align-items-center gap-1.5" onClick={() => { onClose(); onOpenSign(request, 'requester'); }}>
                  <PenTool size={13} />
                  <span>Tanda Tangani Sebagai Requester (Zone)</span>
                </button>
              )}

              {/* Manager Sign Button (Manager as Checker) */}
              {canSignManager && (
                <button type="button" className="btn btn-primary btn-sm px-3 fw-bold shadow-sm d-flex align-items-center gap-1.5" onClick={() => { onClose(); onOpenSign(request, 'manager'); }}>
                  <PenTool size={13} />
                  <span>Tanda Tangani Sebagai Checker (Manager)</span>
                </button>
              )}

              {/* Checker 1 Sign Button (GM) */}
              {canSignGm && (
                <button type="button" className="btn btn-info btn-sm px-3 fw-bold text-white shadow-sm d-flex align-items-center gap-1.5" onClick={() => { onClose(); onOpenSign(request, 'gm'); }}>
                  <PenTool size={13} />
                  <span>Tanda Tangani Sebagai Checker (GM)</span>
                </button>
              )}

              {/* Checker 2 Sign Button (Finance) */}
              {canSignFinanceChecker && (
                <button type="button" className="btn btn-success btn-sm px-3 fw-bold shadow-sm d-flex align-items-center gap-1.5" onClick={() => { onClose(); onOpenSign(request, 'finance'); }}>
                  <PenTool size={13} />
                  <span>Tanda Tangani Sebagai Checker (Finance)</span>
                </button>
              )}

              {/* Approval Sign Button (Direksi / Owner) */}
              {canSignOwner && (
                <button type="button" className="btn btn-purple text-white btn-sm px-3 fw-bold shadow-sm d-flex align-items-center gap-1.5" style={{ backgroundColor: '#9333ea' }} onClick={() => { onClose(); onOpenSign(request, 'owner'); }}>
                  <PenTool size={13} />
                  <span>Tanda Tangani Sebagai Approval (Direksi)</span>
                </button>
              )}

              {/* Finance Disburse Button */}
              {canDisburse && (
                <button type="button" className="btn btn-success btn-sm px-4 fw-bold shadow-sm d-flex align-items-center gap-1.5" onClick={() => { onClose(); onOpenDisburse(request); }}>
                  <span>💵</span>
                  <span>Cairkan Dana (Finance)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Pratinjau Dokumen PDF Lampiran */}
      {showPdfPreview && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', zIndex: 1070 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: '900px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
              {/* Header */}
              <div className="modal-header bg-dark text-white py-2.5 px-4 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <FileText size={18} className="text-danger" />
                  <div>
                    <h6 className="modal-title fw-bold mb-0 text-white" style={{ fontSize: '0.88rem' }}>
                      Pratinjau Berkas Lampiran PDF
                    </h6>
                    <small className="text-white text-opacity-75 font-mono" style={{ fontSize: '0.68rem' }}>
                      {request.pdf_filename || 'Dokumen_Permohonan_External.pdf'}
                    </small>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-primary py-1 px-3 fw-bold d-flex align-items-center gap-1" 
                    style={{ fontSize: '0.75rem' }}
                    onClick={handlePrintSignedDocument}
                  >
                    <Printer size={13} />
                    <span>Cetak Lembar TTD</span>
                  </button>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowPdfPreview(false)}></button>
                </div>
              </div>

              {/* Body */}
              <div className="modal-body p-0 bg-light" style={{ height: '70vh', minHeight: '480px' }}>
                {request.pdf_url ? (
                  <iframe 
                    src={request.pdf_url} 
                    title="Pratinjau PDF"
                    className="w-100 h-100 border-0"
                  />
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4 text-center">
                    <FileText size={48} className="text-muted mb-2 opacity-50" />
                    <h6 className="fw-bold text-dark mb-1">Lampiran Dokumen PDF Resmi</h6>
                    <p className="text-muted small mb-3 font-mono" style={{ maxWidth: '400px', fontSize: '0.75rem' }}>
                      {request.pdf_filename || 'Dokumen_Permohonan_External.pdf'}
                    </p>
                    <button 
                      type="button" 
                      className="btn btn-dark btn-sm px-4 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                      onClick={handlePrintSignedDocument}
                    >
                      <Printer size={14} />
                      <span>Buka &amp; Cetak Surat Otorisasi (5 TTD)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer bg-white py-2 px-4 d-flex justify-content-between border-top">
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                  Dokumen Surat Permohonan Resmi PT BSM &bull; Nomor: {request.request_number}
                </small>
                <button type="button" className="btn btn-secondary btn-sm px-3" onClick={() => setShowPdfPreview(false)}>
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
