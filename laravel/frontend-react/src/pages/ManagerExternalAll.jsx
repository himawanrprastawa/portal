import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileCheck, 
  Search, 
  PenTool, 
  Download,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  FileText
} from 'lucide-react';

export default function ManagerExternalAll({ 
  zoneRequests, 
  onViewDetail, 
  onOpenSign,
  onDelete
}) {
  const { formatCurrency, currentUser } = useAuth();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const isMaster = currentUser?.role === 'Master' || (currentUser?.role || '').toLowerCase().includes('master');
  const userRole = (currentUser?.role || '').toLowerCase();
  const isManager = userRole === 'manager' || userRole.includes('manager ops');
  const isGM = userRole.includes('general manager') || userRole === 'gm';
  const isDireksi = userRole.includes('direksi') || userRole.includes('owner');

  const total = (zoneRequests || []).length;
  const completed = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('sudah dicairkan')).length;
  const approved = (zoneRequests || []).filter(r => (r.status || '').toLowerCase().includes('disetujui sah direksi')).length;

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

  const handleDownloadPdf = (req) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Izinkan popup browser untuk mengunduh dokumen PDF resmi.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Dokumen Permohonan &amp; Lembar Otorisasi - ${req.request_number || 'REQ-EXT'}</title>
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
              <p>Perihal: <strong>${req.title || '-'}</strong> &bull; Wilayah: <strong>${req.zone_name || 'Zone 1, Jabodetabek'}</strong> &bull; Kategori: <strong>${req.category || 'Pembayaran Tim External'}</strong></p>
            </div>
            <div class="meta">
              <div class="num">No. ${req.request_number || 'REQ-EXT'}</div>
              <div class="cost">${formatCurrency(req.estimated_cost || 0)}</div>
            </div>
          </div>

          <!-- DOKUMEN ASLI / INVOICE FULL SCALE 100% DENGAN FOOTER DIPOTONG 25% -->
          <div id="pdf-render-container" class="pdf-render-container">
            ${req.pdf_url ? `
              <div id="pdf-loading-indicator" style="padding: 30px; text-align: center; color: #64748b;">
                <p>Memuat dan merender lembar PDF lampiran (Scale 100% &bull; Crop Footer 25%)...</p>
              </div>
            ` : `
              <div class="pdf-fallback-card">
                <div style="font-size: 22pt; margin-bottom: 4px;">📄</div>
                <h4 style="margin: 0 0 4px 0; color: #0f172a;">${req.pdf_filename || 'Dokumen_Permohonan_External.pdf'}</h4>
                <p style="font-size: 8pt; margin: 0;">Diajukan oleh: <strong>${req.requester_name || 'Zone Manager'}</strong> pada <strong>${req.created_at || '-'}</strong></p>
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
                      ${req.requester_signature ? `<img src="${req.requester_signature}" alt="TTD Requester" />` : '<span style="color:#94a3b8;">(Belum TTD)</span>'}
                    </div>
                    <div class="sig-name">${req.requester_name || 'Zone Manager'}</div>
                    <div class="sig-date">${req.requester_signed_at || req.created_at || '-'}</div>
                    ${req.requester_signed_at ? '<div class="valid-badge">✓ SAH</div>' : ''}
                  </td>
                  <td>
                    <div class="sig-box">
                      ${req.manager_signature ? `<img src="${req.manager_signature}" alt="TTD Manager" />` : '<span style="color:#94a3b8;">(Belum TTD)</span>'}
                    </div>
                    <div class="sig-name">${req.manager_name || 'pandu (Manager)'}</div>
                    <div class="sig-date">${req.manager_signed_at || '-'}</div>
                    ${req.manager_signed_at ? '<div class="valid-badge">✓ SAH</div>' : ''}
                  </td>
                  <td>
                    <div class="sig-box">
                      ${req.gm_signature ? `<img src="${req.gm_signature}" alt="TTD GM" />` : '<span style="color:#94a3b8;">(Belum TTD)</span>'}
                    </div>
                    <div class="sig-name">${req.gm_name || 'General Manager'}</div>
                    <div class="sig-date">${req.gm_signed_at || '-'}</div>
                    ${req.gm_signed_at ? '<div class="valid-badge">✓ SAH</div>' : ''}
                  </td>
                  <td>
                    <div class="sig-box">
                      ${req.finance_checker_signature ? `<img src="${req.finance_checker_signature}" alt="TTD Finance" />` : '<span style="color:#94a3b8;">(Belum TTD)</span>'}
                    </div>
                    <div class="sig-name">${req.finance_checker_name || 'himawan (Finance)'}</div>
                    <div class="sig-date">${req.finance_checker_signed_at || '-'}</div>
                    ${req.finance_checker_signed_at ? '<div class="valid-badge">✓ SAH VERIFIKASI</div>' : ''}
                  </td>
                  <td>
                    <div class="sig-box">
                      ${req.owner_signature ? `<img src="${req.owner_signature}" alt="TTD Owner" />` : '<span style="color:#94a3b8;">(Belum TTD)</span>'}
                    </div>
                    <div class="sig-name">${req.owner_name || 'Direksi Utama / Owner'}</div>
                    <div class="sig-date">${req.owner_signed_at || '-'}</div>
                    ${req.owner_signed_at ? '<div class="valid-badge">👑 APPROVAL FINAL</div>' : ''}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="footer-note">
              <span>BSM Portal Digital Validation &bull; Kode: BSM-${req.id || 'EXT'}-${Date.now()}</span>
              <span>Dokumen Sah 1 Halaman (Scale 100% &bull; Crop Footer 25%)</span>
            </div>
          </div>
        </div>

        <script>
          const pdfDataUrl = ${JSON.stringify(req.pdf_url || '')};
          
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
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark mb-0.5" style={{ letterSpacing: '-0.02em' }}>
            Semua Data Dokumen External (PDF &amp; Otorisasi)
          </h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
            Daftar lengkap seluruh berkas permohonan external beserta status tanda tangan digital (Requester &rarr; Manager &rarr; GM &rarr; Finance &rarr; Direksi)
          </p>
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
              <option value="All">Semua Tahapan Permohonan ({total})</option>
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
                <th className="text-center" style={{ minWidth: '180px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => {
                const canSignNow = 
                  (isManager && req.status === 'Menunggu TTD Manager') ||
                  (isGM && req.status === 'Menunggu TTD Checker (GM)') ||
                  (isDireksi && req.status === 'Menunggu TTD Approval (Direksi)') ||
                  isMaster;

                const currentRole = isManager ? 'manager' : isGM ? 'gm' : isDireksi ? 'owner' : 'manager';

                const canDelete = isMaster || 
                  userRole.includes('finance') ||
                  (currentUser?.role && currentUser.role.toLowerCase().includes('finance')) ||
                  (currentUser?.employee_name && req.requester_name && req.requester_name.toLowerCase().includes(currentUser.employee_name.toLowerCase())) ||
                  (currentUser?.username && req.requester_name && req.requester_name.toLowerCase().includes(currentUser.username.toLowerCase())) ||
                  (currentUser?.name && req.requester_name && req.requester_name.toLowerCase().includes(currentUser.name.toLowerCase())) ||
                  userRole.includes('zone');

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

                        {/* Signer badges summary */}
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
                          title="Lihat Detail & Otorisasi"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Download PDF Button (Icon Only) */}
                        <button 
                          className="btn btn-sm btn-light border text-primary p-1 rounded-2 shadow-2xs d-inline-flex align-items-center justify-content-center"
                          style={{ width: '30px', height: '30px' }}
                          onClick={() => handleDownloadPdf(req)}
                          title="Download Dokumen PDF Ber-TTD Sah"
                        >
                          <Download size={14} />
                        </button>

                        {/* Direct TTD Button if pending for user role (Icon Only) */}
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

                        {/* Delete Button (Icon Only) */}
                        {canDelete && onDelete && (
                          <button 
                            className="btn btn-sm btn-light border text-danger p-1 rounded-2 shadow-2xs d-inline-flex align-items-center justify-content-center"
                            style={{ width: '30px', height: '30px' }}
                            onClick={() => onDelete(req.id)}
                            title="Hapus Dokumen Permohonan"
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

