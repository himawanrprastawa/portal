import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function ComcaseApprovalModal({ 
  show, 
  onClose, 
  comcase, 
  approvalType, // 'zone' or 'manager'
  initialAction, // 'approve' or 'reject'
  onSubmit 
}) {
  const { formatCurrency, currentUser } = useAuth();
  const [action, setAction] = useState('approve'); // 'approve' or 'reject'
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setAction(initialAction || 'approve');
      setNotes('');
    }
  }, [show, initialAction]);

  if (!show || !comcase) return null;

  const isZone = approvalType === 'zone';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (action === 'reject' && !notes.trim()) {
      alert('Alasan penolakan pengajuan wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        id: comcase.id,
        approved: action === 'approve',
        notes,
        reviewerName: currentUser?.employee_name || currentUser?.username || (isZone ? 'Zone Manager' : 'Manager Operasional')
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className={`modal-header py-3 px-4 text-white ${action === 'approve' ? (isZone ? 'bg-primary' : 'bg-info') : 'bg-danger'}`}>
            <div className="d-flex align-items-center gap-2">
              {action === 'approve' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <h5 className="modal-title h6 fw-bold mb-0">
                {action === 'approve' ? (isZone ? 'Verifikasi Pengajuan (Zone Manager)' : 'Approval Pengajuan (Manager)') : 'Tolak Pengajuan Comcase'}
              </h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 small">
              {/* Comcase Summary */}
              <div className="p-3 bg-light rounded-3 border mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">No. Comcase:</span>
                  <strong className="font-mono text-dark">{comcase.id}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Project &amp; Site:</span>
                  <strong className="text-dark">{comcase.project} ({comcase.siteId})</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Nominal:</span>
                  <span className="font-mono fw-bold text-primary">{formatCurrency(comcase.amount)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Penerima:</span>
                  <span className="text-dark">{comcase.recipientName} ({comcase.bankName})</span>
                </div>
              </div>

              {/* Action Toggle */}
              <div className="d-flex gap-2 mb-3">
                <button 
                  type="button" 
                  className={`btn btn-sm flex-fill fw-bold ${action === 'approve' ? (isZone ? 'btn-primary' : 'btn-info text-white') : 'btn-outline-secondary'}`}
                  onClick={() => setAction('approve')}
                >
                  ✓ {isZone ? 'Setujui ke Manager' : 'Setujui ke Finance'}
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm flex-fill fw-bold ${action === 'reject' ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => setAction('reject')}
                >
                  ✕ Tolak Berkas
                </button>
              </div>

              {/* Notes Input */}
              <div className="mb-2">
                <label className="form-label fw-bold text-dark mb-1">
                  {action === 'approve' ? (isZone ? 'Catatan Verifikasi Zone Manager (Opsional):' : 'Instruksi / Catatan untuk Finance (Opsional):') : 'Alasan Penolakan Pengajuan (Wajib Diisi) *:'}
                </label>
                <textarea 
                  className="form-control form-control-sm"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={action === 'approve' ? 'Contoh: Verifikasi kebutuhan site sudah sesuai urgensi...' : 'Contoh: Berkas Kwitansi/BA belum jelas, harap revisi...'}
                  required={action === 'reject'}
                />
              </div>
            </div>

            <div className="modal-footer bg-light py-2 px-4 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary btn-sm px-3" onClick={onClose} disabled={saving}>
                Batal
              </button>
              <button 
                type="submit" 
                className={`btn btn-sm px-4 fw-bold shadow-xs ${action === 'approve' ? (isZone ? 'btn-primary' : 'btn-info text-white') : 'btn-danger'}`}
                disabled={saving}
              >
                <span>{saving ? 'Menyimpan...' : (action === 'approve' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Tolak')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

