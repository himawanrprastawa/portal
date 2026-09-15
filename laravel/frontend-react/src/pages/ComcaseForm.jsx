import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, UploadCloud, X, ArrowLeft, AlertCircle, Camera, FileText, Receipt, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ComcaseForm({ editingData, rejectedBanner, onSave, onCancel }) {
  const { currentUser, showToast } = useAuth();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    project: '',
    teamLeader: '',
    activity: '',
    siteId: '',
    amount: '',
    accountNumber: '',
    bankName: 'BCA',
    recipientName: '',
    docBeritaAcara: '',
    docBeritaAcaraPreview: null,
    docKwitansi: '',
    docKwitansiPreview: null,
    docFoto: '',
    docFotoPreview: null,
    docPatwal: '',
    docPatwalPreview: null,
    notes: ''
  });

  const [saving, setSaving] = useState(false);
  const submittingLockRef = useRef(false);

  useEffect(() => {
    if (editingData) {
      setFormData({
        ...editingData,
        amount: editingData.amount || ''
      });
    }
  }, [editingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, fieldName, previewField) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({
          ...prev,
          [fieldName]: file.name,
          [previewField]: ev.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || submittingLockRef.current) return;

    if (!formData.project || !formData.amount || !formData.recipientName) {
      showToast('Harap lengkapi semua kolom wajib.', 'error');
      return;
    }

    submittingLockRef.current = true;
    setSaving(true);
    try {
      await onSave({
        ...formData,
        submittedBy: currentUser?.employee_name || currentUser?.username || 'Supervisor',
        amount: parseFloat(formData.amount) || 0
      });
    } catch (err) {
      console.error(err);
      submittingLockRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4 fade-in" style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 bg-white p-3 p-md-4 rounded-4 border shadow-xs">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm p-1.5" onClick={onCancel}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="h5 fw-black text-dark mb-1">
              {editingData ? `Edit & Revisi Comcase (${editingData.id})` : 'Form Pengajuan Request Comcase'}
            </h2>
            <p className="text-muted small mb-0">
              Pengajuan kebutuhan darurat operasional lapangan &rarr; akan direview oleh <strong>Zone Manager</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Rejected Alert Banner if in revision mode */}
      {rejectedBanner && (
        <div className="alert alert-danger border-danger border-opacity-25 rounded-4 p-3 mb-4 shadow-xs" role="alert">
          <div className="d-flex align-items-start gap-2">
            <AlertCircle size={20} className="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <strong className="d-block text-danger fw-bold">Catatan Penolakan Berkas:</strong>
              <p className="small mb-1 text-dark">"{rejectedBanner.reason}"</p>
              <small className="text-muted">Ditolak oleh: {rejectedBanner.rejectedBy} pada {rejectedBanner.rejectedAt}</small>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="card border-0 shadow-xs rounded-4 bg-white p-4">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Informasi Proyek & Lokasi */}
          <h6 className="fw-bold text-primary mb-3 pb-2 border-bottom">1. Informasi Site &amp; Aktivitas Lapangan</h6>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark">Tanggal Pengajuan <span className="text-danger">*</span></label>
              <input 
                type="date" 
                name="date" 
                className="form-control form-control-sm"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-8">
              <label className="form-label small fw-bold text-dark">Nama Project / Pekerjaan <span className="text-danger">*</span></label>
              <input 
                type="text" 
                name="project" 
                className="form-control form-control-sm"
                placeholder="Contoh: Project Relokasi Fiber Optic Site Telkomsel"
                value={formData.project}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">Site ID / Cluster Site <span className="text-danger">*</span></label>
              <input 
                type="text" 
                name="siteId" 
                className="form-control form-control-sm font-mono"
                placeholder="Contoh: BDO0123 / Area Cicaheum"
                value={formData.siteId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">Team Leader (TL) Lapangan <span className="text-danger">*</span></label>
              <input 
                type="text" 
                name="teamLeader" 
                className="form-control form-control-sm"
                placeholder="Contoh: Agus Setiawan"
                value={formData.teamLeader}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-bold text-dark">Deskripsi Aktivitas &amp; Keperluan Darurat <span className="text-danger">*</span></label>
              <textarea 
                name="activity" 
                className="form-control form-control-sm"
                rows="2"
                placeholder="Contoh: Pembelian kabel patchcord darurat dan koordinasi warga setempat untuk izin lintasan..."
                value={formData.activity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Section 2: Rekening & Nominal */}
          <h6 className="fw-bold text-primary mb-3 pb-2 border-bottom">2. Nominal Pengajuan &amp; Rekening Tujuan</h6>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">Nominal Pengajuan (IDR) <span className="text-danger">*</span></label>
              <input 
                type="number" 
                name="amount" 
                className="form-control form-control-sm font-mono fw-bold"
                placeholder="0"
                min="1000"
                step="1000"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">Nama Pemilik Rekening (Penerima) <span className="text-danger">*</span></label>
              <input 
                type="text" 
                name="recipientName" 
                className="form-control form-control-sm"
                placeholder="Contoh: Hendra Kurniawan"
                value={formData.recipientName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">Bank Penerima <span className="text-danger">*</span></label>
              <select 
                name="bankName" 
                className="form-select form-select-sm"
                value={formData.bankName}
                onChange={handleChange}
              >
                <option value="BCA">BCA (Bank Central Asia)</option>
                <option value="Mandiri">Bank Mandiri</option>
                <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                <option value="BNI">BNI (Bank Negara Indonesia)</option>
                <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                <option value="CIMB">CIMB Niaga</option>
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark">Nomor Rekening <span className="text-danger">*</span></label>
              <input 
                type="text" 
                name="accountNumber" 
                className="form-control form-control-sm font-mono"
                placeholder="Contoh: 1234567890"
                value={formData.accountNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Section 3: Berkas Dokumen Bukti */}
          <h6 className="fw-bold text-primary mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
            <span>3. Lampiran Dokumen Bukti Lapangan</span>
            <small className="text-muted fw-normal text-xs">*Format: JPG, PNG, atau PDF</small>
          </h6>
          
          <div className="row g-3 mb-4">
            {/* 1. Foto */}
            <div className="col-12 col-sm-6 col-md-3">
              <div className={`card h-100 border text-center p-3 rounded-4 transition-all ${formData.docFoto ? 'border-primary bg-primary bg-opacity-10 shadow-xs' : 'bg-light border-dashed'}`}>
                <div className="d-flex align-items-center justify-content-center gap-1.5 mb-2">
                  <Camera size={16} className={formData.docFoto ? 'text-primary' : 'text-muted'} />
                  <span className="small fw-bold text-dark">Foto</span>
                </div>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="d-none" 
                  id="upload-foto-site"
                  onChange={(e) => handleFileUpload(e, 'docFoto', 'docFotoPreview')}
                />
                
                <label 
                  htmlFor="upload-foto-site" 
                  className={`btn btn-sm w-100 py-1.5 rounded-3 d-flex align-items-center justify-content-center gap-1.5 cursor-pointer ${
                    formData.docFoto ? 'btn-primary text-white shadow-xs' : 'btn-outline-primary bg-white'
                  }`}
                >
                  <UploadCloud size={14} />
                  <span className="text-xs fw-semibold">{formData.docFoto ? 'Ganti Foto' : 'Pilih Foto'}</span>
                </label>

                {formData.docFotoPreview && (
                  <div className="position-relative mt-2 rounded-3 overflow-hidden border">
                    <img src={formData.docFotoPreview} alt="Preview Foto" className="w-100" style={{ height: '75px', objectFit: 'cover' }} />
                    <button 
                      type="button" 
                      className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0 m-1 rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                      style={{ width: 20, height: 20 }} 
                      onClick={() => setFormData(p => ({ ...p, docFoto: '', docFotoPreview: null }))}
                      title="Hapus Foto"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                {formData.docFoto && !formData.docFotoPreview && (
                  <div className="mt-2 text-xs text-truncate text-primary fw-medium">
                    <CheckCircle2 size={12} className="me-1 inline" />
                    {formData.docFoto}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Berita Acara */}
            <div className="col-12 col-sm-6 col-md-3">
              <div className={`card h-100 border text-center p-3 rounded-4 transition-all ${formData.docBeritaAcara ? 'border-info bg-info bg-opacity-10 shadow-xs' : 'bg-light border-dashed'}`}>
                <div className="d-flex align-items-center justify-content-center gap-1.5 mb-2">
                  <FileText size={16} className={formData.docBeritaAcara ? 'text-info' : 'text-muted'} />
                  <span className="small fw-bold text-dark">Berita Acara (BA)</span>
                </div>

                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="d-none" 
                  id="upload-ba"
                  onChange={(e) => handleFileUpload(e, 'docBeritaAcara', 'docBeritaAcaraPreview')}
                />
                
                <label 
                  htmlFor="upload-ba" 
                  className={`btn btn-sm w-100 py-1.5 rounded-3 d-flex align-items-center justify-content-center gap-1.5 cursor-pointer ${
                    formData.docBeritaAcara ? 'btn-info text-white shadow-xs' : 'btn-outline-info bg-white'
                  }`}
                >
                  <UploadCloud size={14} />
                  <span className="text-xs fw-semibold">{formData.docBeritaAcara ? 'Ganti BA' : 'Pilih BA'}</span>
                </label>

                {formData.docBeritaAcara && (
                  <div className="d-flex align-items-center justify-content-between bg-white border border-info border-opacity-25 rounded-2 px-2 py-1 mt-2">
                    <span className="text-2xs text-dark text-truncate text-start flex-grow-1">{formData.docBeritaAcara}</span>
                    <button 
                      type="button" 
                      className="btn btn-link text-danger p-0 ms-1" 
                      onClick={() => setFormData(p => ({ ...p, docBeritaAcara: '', docBeritaAcaraPreview: null }))}
                      title="Hapus"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Kwitansi */}
            <div className="col-12 col-sm-6 col-md-3">
              <div className={`card h-100 border text-center p-3 rounded-4 transition-all ${formData.docKwitansi ? 'border-success bg-success bg-opacity-10 shadow-xs' : 'bg-light border-dashed'}`}>
                <div className="d-flex align-items-center justify-content-center gap-1.5 mb-2">
                  <Receipt size={16} className={formData.docKwitansi ? 'text-success' : 'text-muted'} />
                  <span className="small fw-bold text-dark">Nota / Kwitansi</span>
                </div>

                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="d-none" 
                  id="upload-kwt"
                  onChange={(e) => handleFileUpload(e, 'docKwitansi', 'docKwitansiPreview')}
                />
                
                <label 
                  htmlFor="upload-kwt" 
                  className={`btn btn-sm w-100 py-1.5 rounded-3 d-flex align-items-center justify-content-center gap-1.5 cursor-pointer ${
                    formData.docKwitansi ? 'btn-success text-white shadow-xs' : 'btn-outline-success bg-white'
                  }`}
                >
                  <UploadCloud size={14} />
                  <span className="text-xs fw-semibold">{formData.docKwitansi ? 'Ganti Nota' : 'Pilih Nota'}</span>
                </label>

                {formData.docKwitansi && (
                  <div className="d-flex align-items-center justify-content-between bg-white border border-success border-opacity-25 rounded-2 px-2 py-1 mt-2">
                    <span className="text-2xs text-dark text-truncate text-start flex-grow-1">{formData.docKwitansi}</span>
                    <button 
                      type="button" 
                      className="btn btn-link text-danger p-0 ms-1" 
                      onClick={() => setFormData(p => ({ ...p, docKwitansi: '', docKwitansiPreview: null }))}
                      title="Hapus"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Patwal */}
            <div className="col-12 col-sm-6 col-md-3">
              <div className={`card h-100 border text-center p-3 rounded-4 transition-all ${formData.docPatwal ? 'border-secondary bg-secondary bg-opacity-10 shadow-xs' : 'bg-light border-dashed'}`}>
                <div className="d-flex align-items-center justify-content-center gap-1.5 mb-2">
                  <ShieldCheck size={16} className={formData.docPatwal ? 'text-secondary' : 'text-muted'} />
                  <span className="small fw-bold text-dark">Patwal (Opsional)</span>
                </div>

                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="d-none" 
                  id="upload-patwal"
                  onChange={(e) => handleFileUpload(e, 'docPatwal', 'docPatwalPreview')}
                />
                
                <label 
                  htmlFor="upload-patwal" 
                  className={`btn btn-sm w-100 py-1.5 rounded-3 d-flex align-items-center justify-content-center gap-1.5 cursor-pointer ${
                    formData.docPatwal ? 'btn-secondary text-white shadow-xs' : 'btn-outline-secondary bg-white'
                  }`}
                >
                  <UploadCloud size={14} />
                  <span className="text-xs fw-semibold">{formData.docPatwal ? 'Ganti Patwal' : 'Pilih Patwal'}</span>
                </label>

                {formData.docPatwal && (
                  <div className="d-flex align-items-center justify-content-between bg-white border border-secondary border-opacity-25 rounded-2 px-2 py-1 mt-2">
                    <span className="text-2xs text-dark text-truncate text-start flex-grow-1">{formData.docPatwal}</span>
                    <button 
                      type="button" 
                      className="btn btn-link text-danger p-0 ms-1" 
                      onClick={() => setFormData(p => ({ ...p, docPatwal: '', docPatwalPreview: null }))}
                      title="Hapus"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="d-flex align-items-center justify-content-end gap-3 pt-4 border-top">
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-sm px-4 py-2 rounded-3 fw-semibold" 
              onClick={onCancel} 
              disabled={saving}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn btn-warning btn-sm px-4 py-2 rounded-3 fw-bold shadow-sm d-flex align-items-center gap-2 text-dark" 
              disabled={saving}
            >
              <Send size={16} />
              <span>{saving ? 'Mengirim Pengajuan...' : (editingData ? 'Simpan & Ajukan Ulang' : 'Kirim Request ke Zone Manager')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

