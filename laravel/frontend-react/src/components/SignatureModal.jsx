import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PenTool, CheckCircle, RotateCcw, X, ShieldCheck, User } from 'lucide-react';

export default function SignatureModal({ show, onClose, onSave, signingRole, requestData }) {
  const { currentUser } = useAuth();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [notes, setNotes] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      // Auto-set signer name to the logged in user's account name and role
      const accName = currentUser?.employee_name || currentUser?.name || currentUser?.username || '';
      const accRole = currentUser?.role || '';
      const fullSignerLabel = accName && accRole && !accName.includes(accRole) 
        ? `${accName} (${accRole})` 
        : (accName || currentUser?.username || '');

      setSignerName(fullSignerLabel);
      
      // Default disposition note based on signing stage
      if (signingRole === 'requester') {
        setNotes('Permohonan diajukan secara resmi oleh Zone Manager.');
      } else if (signingRole === 'manager') {
        setNotes('Disetujui Manager Operasional, urgensi perbaikan site diverifikasi.');
      } else if (signingRole === 'gm') {
        setNotes('Disetujui Checker 1 (General Manager), alokasi operasional diverifikasi.');
      } else if (signingRole === 'finance') {
        setNotes('Disetujui Checker 2 (Finance), ketersediaan anggaran kas terverifikasi.');
      } else if (signingRole === 'owner') {
        setNotes('Disetujui penuh oleh Direksi / Owner untuk segera dicairkan dan ditransfer oleh Finance.');
      } else {
        setNotes('');
      }

      setHasSignature(false);
      setTimeout(() => {
        initCanvas();
      }, 150);
    }
  }, [show, currentUser, signingRole]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasSignature(true);
    const pos = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (isDrawing) {
      e.preventDefault();
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    initCanvas();
    setHasSignature(false);
  };

  const handleSubmit = async (isApproved) => {
    let signatureData = '';
    if (canvasRef.current) {
      try {
        signatureData = canvasRef.current.toDataURL('image/png');
      } catch (e) {}
    }

    if (isApproved && !hasSignature && (!signatureData || signatureData.length < 100)) {
      alert('Silakan goreskan tanda tangan Anda pada kotak tanda tangan terlebih dahulu.');
      return;
    }
    if (!signerName.trim()) {
      alert('Nama penandatangan wajib diisi.');
      return;
    }

    setSaving(true);

    try {
      const uRole = (currentUser?.role || '').toLowerCase();
      const effectiveRole = signingRole || (
        uRole === 'manager' || uRole.includes('manager ops') ? 'manager' :
        uRole.includes('general manager') || uRole === 'gm' ? 'gm' :
        uRole.includes('finance') ? 'finance' :
        uRole.includes('direksi') || uRole.includes('owner') ? 'owner' : 'requester'
      );

      await onSave({
        signerRole: effectiveRole,
        signerName: signerName.trim(),
        signatureData,
        notes,
        isApproved
      });
      onClose();
    } catch (err) {
      console.error('Save signature error:', err);
      alert('Terjadi kendala saat menyimpan tanda tangan: ' + (err.message || 'Silakan periksa koneksi.'));
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  const roleTitle = signingRole === 'requester' ? '1. Requester (Zone Manager)' :
                    signingRole === 'manager' ? '2. Checker (Manager)' :
                    signingRole === 'gm' ? '3. Checker 1 (General Manager)' :
                    signingRole === 'finance' ? '4. Checker 2 (Finance)' :
                    signingRole === 'owner' ? '5. Approval (Direksi / Owner)' : 'Otorisasi Tanda Tangan Sah';

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-primary text-white py-3">
            <div className="d-flex align-items-center gap-2">
              <PenTool size={20} />
              <div>
                <h5 className="modal-title h6 fw-bold mb-0">Tanda Tangan Digital &amp; Otorisasi Sah</h5>
                <small className="text-white text-opacity-75" style={{ fontSize: '0.72rem' }}>
                  Tahap Otorisasi: <strong>{roleTitle}</strong>
                </small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={saving}></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {/* Request Summary Banner */}
            {requestData && (
              <div className="p-3 bg-light rounded-3 border mb-3 small">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Nomor Surat:</span>
                  <strong className="font-mono text-dark">{requestData.request_number}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Perihal:</span>
                  <strong className="text-dark text-end" style={{ maxWidth: '65%' }}>{requestData.title}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Wilayah / Zona:</span>
                  <span className="badge bg-secondary">{requestData.zone_name}</span>
                </div>
              </div>
            )}

            {/* Input Signer Name (Auto-filled with logged-in account) */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark small mb-1 d-flex justify-content-between">
                <span>Nama Penandatangan (Sesuai Akun Aktif) <span className="text-danger">*</span></span>
                <small className="text-primary font-medium">Akun: @{currentUser?.username} ({currentUser?.role})</small>
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <User size={13} />
                </span>
                <input 
                  type="text" 
                  className="form-control form-control-clean border-start-0 font-medium"
                  style={{ fontSize: '0.8rem' }}
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Nama pejabat yang menandatangani"
                  required
                />
              </div>
            </div>

            {/* Touch Signature Canvas Pad */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label fw-bold text-dark small mb-0">
                  Goreskan Tanda Tangan Anda (Touchscreen / Mouse) <span className="text-danger">*</span>
                </label>
                <button type="button" className="btn btn-outline-secondary btn-sm py-0 px-2" onClick={clearCanvas} style={{ fontSize: '0.75rem' }}>
                  <RotateCcw size={12} className="me-1" />
                  Hapus / Ulangi
                </button>
              </div>

              <div className="signature-canvas-container bg-white border rounded-3 position-relative" style={{ height: '180px' }}>
                <canvas 
                  ref={canvasRef}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasSignature && (
                  <div className="position-absolute top-50 start-50 translate-middle text-muted text-center pointer-events-none opacity-50" style={{ pointerEvents: 'none' }}>
                    <PenTool size={28} className="mb-1 d-block mx-auto" />
                    <span style={{ fontSize: '0.75rem' }}>Gunakan jari atau kursor pada kotak ini</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes / Catatan Disposisi */}
            <div className="mb-2">
              <label className="form-label fw-bold text-dark small mb-1">
                Catatan / Instruksi Disposisi Otorisasi
              </label>
              <textarea 
                className="form-control form-control-sm" 
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan persetujuan / verifikasi..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-light py-2 px-4 d-flex justify-content-between">
            <button 
              type="button" 
              className="btn btn-outline-danger btn-sm px-3 fw-bold"
              onClick={() => handleSubmit(false)}
              disabled={saving}
            >
              ✕ Tolak Permohonan
            </button>

            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm px-3" 
                onClick={onClose}
                disabled={saving}
              >
                Batal
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-sm px-4 fw-bold shadow-sm d-flex align-items-center gap-1.5"
                onClick={() => handleSubmit(true)}
                disabled={saving}
              >
                <CheckCircle size={16} />
                <span>{saving ? 'Menyimpan...' : 'Bubuhkan Tanda Tangan & Setujui'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
