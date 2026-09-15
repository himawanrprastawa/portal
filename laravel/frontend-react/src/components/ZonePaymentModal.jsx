import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, UploadCloud, CheckCircle2 } from 'lucide-react';

export default function ZonePaymentModal({ show, onClose, request, onSubmit }) {
  const { formatCurrency, currentUser } = useAuth();
  const [form, setForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paidBy: currentUser?.employee_name || currentUser?.username || 'Finance',
    amount: '',
    paymentReceipt: '',
    paymentReceiptPreview: null,
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show && request) {
      setForm({
        paymentDate: new Date().toISOString().split('T')[0],
        paidBy: currentUser?.employee_name || currentUser?.username || 'Finance',
        amount: request.estimated_cost || '',
        paymentReceipt: '',
        paymentReceiptPreview: null,
        notes: `Pencairan dana permohonan ${request.request_number} (${request.title})`
      });
    }
  }, [show, request, currentUser]);

  if (!show || !request) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({
          ...prev,
          paymentReceipt: file.name,
          paymentReceiptPreview: ev.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        id: request.id,
        paidBy: form.paidBy,
        paymentDate: form.paymentDate,
        amount: parseFloat(form.amount) || parseFloat(request.estimated_cost) || 0,
        paymentReceipt: form.paymentReceipt,
        notes: form.notes
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
          <div className="modal-header bg-success text-white py-3 px-4">
            <div className="d-flex align-items-center gap-2">
              <CreditCard size={20} />
              <div>
                <h5 className="modal-title h6 fw-bold mb-0">Pencairan Dana Permohonan Zone Manager</h5>
                <small className="text-white text-opacity-75 font-mono" style={{ fontSize: '0.7rem' }}>
                  {request.request_number} &bull; {request.zone_name}
                </small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 small">
              {/* Summary */}
              <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Perihal:</span>
                  <strong className="text-dark text-end" style={{ maxWidth: '60%' }}>{request.title}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Pemohon:</span>
                  <strong className="text-dark">{request.requester_name}</strong>
                </div>
                <div className="d-flex justify-content-between pt-1 border-top border-success border-opacity-25">
                  <span className="text-muted fw-bold">Estimasi Anggaran:</span>
                  <span className="font-mono fw-black text-success fs-5">{formatCurrency(request.estimated_cost)}</span>
                </div>
              </div>

              {/* Tanggal & Nominal Riil */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-bold text-dark mb-1">Tanggal Transfer <span className="text-danger">*</span></label>
                  <input 
                    type="date" 
                    className="form-control form-control-sm"
                    value={form.paymentDate}
                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-bold text-dark mb-1">Nominal Riil (IDR) <span className="text-danger">*</span></label>
                  <input 
                    type="number" 
                    className="form-control form-control-sm font-mono fw-bold"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    min="1000"
                    step="1000"
                    required
                  />
                </div>
              </div>

              {/* Upload Bukti */}
              <div className="mb-3">
                <label className="form-label fw-bold text-dark mb-1">Upload Bukti Transfer Bank (Opsional)</label>
                <div className="p-3 bg-light rounded-3 border text-center">
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    className="d-none" 
                    id="finance-zone-receipt"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="finance-zone-receipt" className="btn btn-outline-success btn-sm py-1 px-3 text-xs mb-1">
                    <UploadCloud size={14} className="me-1" />
                    {form.paymentReceipt ? 'Ganti Bukti Transfer' : 'Pilih Slip / Bukti Transfer'}
                  </label>
                  {form.paymentReceipt && (
                    <small className="text-muted d-block text-truncate mt-1">{form.paymentReceipt}</small>
                  )}
                  {form.paymentReceiptPreview && (
                    <img src={form.paymentReceiptPreview} alt="Receipt" className="img-thumbnail mt-2" style={{ maxHeight: '70px' }} />
                  )}
                </div>
              </div>

              {/* Catatan Finance */}
              <div className="mb-2">
                <label className="form-label fw-bold text-dark mb-1">Catatan Finance (Opsional)</label>
                <textarea 
                  className="form-control form-control-sm"
                  rows="2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Contoh: Ditransfer via Corporate BCA ke rekening Zone Manager..."
                />
              </div>
            </div>

            <div className="modal-footer bg-light py-2 px-4 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary btn-sm px-3" onClick={onClose} disabled={saving}>
                Batal
              </button>
              <button type="submit" className="btn btn-success btn-sm px-4 fw-bold shadow-xs" disabled={saving}>
                <CheckCircle2 size={15} className="me-1" />
                <span>{saving ? 'Menyimpan...' : 'Konfirmasi Pencairan & Simpan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

