import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, FileCheck, X, Sparkles } from 'lucide-react';

export default function ZoneCreateModal({ show, onClose, onSubmit }) {
  const { currentUser, showToast } = useAuth();
  const [form, setForm] = useState({
    zone_name: 'Zone 1, Jabodetabek',
    requester_name: currentUser?.employee_name || currentUser?.name || currentUser?.username || 'Zone Manager',
    title: '',
    category: 'Pembayaran Tim External',
    estimated_cost: '',
    description: '',
    pdf_filename: '',
    pdf_url: ''
  });
  const [customCategory, setCustomCategory] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setForm({
        zone_name: 'Zone 1, Jabodetabek',
        requester_name: currentUser?.employee_name || currentUser?.name || currentUser?.username || 'Zone Manager',
        title: '',
        category: 'Pembayaran Tim External',
        estimated_cost: '',
        description: '',
        pdf_filename: '',
        pdf_url: ''
      });
      setCustomCategory('');
      setSaving(false);
    }
  }, [show, currentUser]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showToast('Dokumen permohonan wajib berformat PDF (.pdf)', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          pdf_filename: file.name,
          pdf_url: reader.result
        }));
        showToast(`Dokumen PDF "${file.name}" siap dilampirkan.`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.estimated_cost) {
      showToast('Harap lengkapi perihal dan estimasi biaya.', 'error');
      return;
    }

    if (!form.pdf_filename) {
      showToast('Wajib melampirkan berkas dokumen surat permohonan format PDF.', 'warning');
      return;
    }

    if (form.category === 'Lain-lain' && !customCategory.trim()) {
      showToast('Harap masukkan nama kategori kustom Anda.', 'warning');
      return;
    }

    setSaving(true);
    onClose(); // Close modal immediately
    try {
      const finalCategory = form.category === 'Lain-lain' && customCategory.trim() 
        ? customCategory.trim() 
        : form.category;

      const payload = {
        ...form,
        category: finalCategory,
        estimated_cost: parseFloat(form.estimated_cost) || 0
      };

      if (onSubmit) {
        await onSubmit(payload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }} 
      tabIndex="-1"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '720px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header bg-primary text-white py-3 px-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <UploadCloud size={20} />
              <div>
                <h5 className="modal-title h6 fw-bold mb-0">Upload Permohonan External &amp; Surat PDF</h5>
                <small className="text-white text-opacity-75" style={{ fontSize: '0.72rem' }}>
                  Alur Otorisasi: <strong>Zone Mgr &rarr; Checker (Manager) &rarr; General Manager &rarr; Owner / Direksi &rarr; Finance</strong>
                </small>
              </div>
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
              aria-label="Tutup"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 small">
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold text-dark">Wilayah / Zona Operasional <span className="text-danger">*</span></label>
                  <select 
                    className="form-select form-select-sm"
                    value={form.zone_name}
                    onChange={(e) => setForm({ ...form, zone_name: e.target.value })}
                  >
                    <option value="Zone 1, Jabodetabek">Zone 1, Jabodetabek</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold text-dark">Nama Pemohon (Zone Manager) <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm bg-light fw-semibold text-dark"
                    value={form.requester_name}
                    readOnly
                    title="Otomatis terisi nama akun yang sedang aktif"
                  />
                  <div className="form-text text-2xs text-muted" style={{ fontSize: '0.68rem' }}>
                    Otomatis nama akun login ({currentUser?.employee_name || currentUser?.username})
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold text-dark">Perihal Permohonan Resmi <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm"
                    placeholder="Contoh: Permohonan Pengadaan Alat Ukur Optical Power Meter Site Area Bandung"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold text-dark">Kategori Permohonan <span className="text-danger">*</span></label>
                  <select 
                    className="form-select form-select-sm"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Pembayaran Tim External">Pembayaran Tim External</option>
                    <option value="Pembelian Tools">Pembelian Tools</option>
                    <option value="Pengadaan Alat / Asset">Pengadaan Alat / Asset</option>
                    <option value="Sewa Kantor / Mess Zona">Sewa Kantor / Mess Zona</option>
                    <option value="Biaya Koordinasi Khusus">Biaya Koordinasi Khusus</option>
                    <option value="Perbaikan Darurat Cluster">Perbaikan Darurat Cluster</option>
                    <option value="Lain-lain">Lain-lain (Kustom)</option>
                  </select>

                  {form.category === 'Lain-lain' && (
                    <div className="mt-2">
                      <input 
                        type="text"
                        className="form-control form-control-sm border-primary"
                        style={{ fontSize: '0.75rem' }}
                        placeholder="Tuliskan nama kategori permohonan kustom Anda..."
                        required
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold text-dark">Estimasi Total Biaya (IDR) <span className="text-danger">*</span></label>
                  <input 
                    type="number" 
                    className="form-control form-control-sm font-mono fw-bold"
                    placeholder="0"
                    min="1000"
                    step="1000"
                    value={form.estimated_cost}
                    onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold text-dark">Uraian Ringkas Kebutuhan</label>
                  <textarea 
                    className="form-control form-control-sm"
                    rows="2"
                    placeholder="Jelaskan secara ringkas latar belakang dan urgensi permohonan zona..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Upload Dokumen PDF Surat */}
                <div className="col-12">
                  <label className="form-label fw-bold text-dark">Upload Surat Permohonan (Format PDF) <span className="text-danger">*</span></label>
                  <div className="p-4 bg-light rounded-3 border border-2 border-dashed text-center">
                    <input 
                      type="file" 
                      accept=".pdf,application/pdf" 
                      className="d-none" 
                      id="upload-zone-pdf"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="upload-zone-pdf" className="btn btn-outline-primary btn-sm px-4 py-2 fw-bold text-xs mb-2">
                      <UploadCloud size={16} className="me-1.5" />
                      {form.pdf_filename ? 'Ganti File PDF' : 'Pilih File PDF dari Komputer / HP'}
                    </label>
                    <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                      PDF resmi dengan tempat tanda tangan Manager, GM, dan Owner (Maks 10MB)
                    </small>
                    {form.pdf_filename && (
                      <div className="mt-2 p-2 bg-white rounded border d-inline-flex align-items-center gap-2 text-xs text-primary font-mono fw-bold">
                        <span>📄 {form.pdf_filename}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light py-2 px-4 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary btn-sm px-3" onClick={onClose} disabled={saving}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold shadow-xs" disabled={saving}>
                <FileCheck size={16} className="me-1" />
                <span>{saving ? 'Mengupload...' : 'Kirim Permohonan ke Manager'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

