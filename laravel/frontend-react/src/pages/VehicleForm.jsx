import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, UploadCloud, ArrowLeft, Send, QrCode, Eye, Trash2, Camera, FileText } from 'lucide-react';

export default function VehicleForm({ editingVehicle, onSave, onCancel, employees }) {
  const { showToast } = useAuth();
  const [form, setForm] = useState({
    barcodeImage: null, // Barcode photo Base64 / URL
    plateNumber: '',
    brandModel: '',
    vendorType: 'Kepemilikan BSM', // 'Kepemilikan BSM' / 'Rental / Sewa Eksternal'
    vendorName: 'PT BSM Internal',
    driverName: '',
    driverWhatsapp: '',
    team: 'Internal', // Internal / External
    status: 'Tersedia', // Tersedia / Dipakai / Servis
    
    // Checklist Kelengkapan Alat (PRD 3.5)
    hasSpareTire: true,
    hasJack: true,
    hasWheelWrench: true,
    hasFirstAidKit: true,

    // Dokumentasi BAST
    docBast: '',
    docBastUrl: null
  });

  const [previewBarcodeModal, setPreviewBarcodeModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingVehicle) {
      const vType = editingVehicle.vendor && editingVehicle.vendor.toLowerCase().includes('rental') 
        ? 'Rental / Sewa Eksternal' 
        : 'Kepemilikan BSM';

      setForm(prev => ({
        ...prev,
        ...editingVehicle,
        barcodeImage: editingVehicle.barcodeImage || editingVehicle.barcode_bbm || editingVehicle.barcode_image || null,
        plateNumber: editingVehicle.plateNumber || editingVehicle.plate_number || '',
        brandModel: editingVehicle.brandModel || editingVehicle.model || '',
        vendorType: vType,
        vendorName: editingVehicle.vendor || (vType === 'Rental / Sewa Eksternal' ? 'Mitra Vendor Eksternal' : 'PT BSM Internal'),
        team: editingVehicle.team || editingVehicle.team_type || (vType === 'Rental / Sewa Eksternal' ? 'External' : 'Internal'),
        docBast: editingVehicle.docBast || editingVehicle.doc_berita_acara || '',
        driverName: editingVehicle.driverName || editingVehicle.driver_name || '',
        driverWhatsapp: editingVehicle.driverWhatsapp || editingVehicle.driver_whatsapp || ''
      }));
    }
  }, [editingVehicle]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Auto-fill logic when Vendor Type changes
  const handleVendorTypeChange = (e) => {
    const selectedType = e.target.value;
    if (selectedType === 'Rental / Sewa Eksternal') {
      setForm(prev => ({
        ...prev,
        vendorType: selectedType,
        vendorName: prev.vendorName && prev.vendorName !== 'PT BSM Internal' ? prev.vendorName : 'Mitra Vendor Rental Eksternal',
        team: 'External' // Otomatis tim penugasan menjadi External Mitra
      }));
    } else {
      setForm(prev => ({
        ...prev,
        vendorType: selectedType,
        vendorName: 'Kepemilikan BSM (Asset Internal)',
        team: 'Internal' // Otomatis tim penugasan menjadi Internal Operasional
      }));
    }
  };

  // Upload Barcode Image (from file/camera/gallery)
  const handleBarcodeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({
          ...prev,
          barcodeImage: ev.target.result,
          barcode_bbm: ev.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBarcode = () => {
    setForm(prev => ({
      ...prev,
      barcodeImage: null,
      barcode_bbm: ''
    }));
  };

  // Upload BAST
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({ 
          ...prev, 
          docBast: file.name,
          docBastUrl: ev.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plateNumber || !form.brandModel) {
      showToast('Harap lengkapi nomor plat dan merk mobil.', 'error');
      return;
    }

    setSaving(true);
    try {
      const finalVendor = form.vendorType === 'Rental / Sewa Eksternal' 
        ? (form.vendorName || 'Rental / Sewa Eksternal') 
        : 'Kepemilikan BSM (Asset Internal)';

      await onSave({
        ...form,
        vendor: finalVendor,
        barcode: form.plateNumber // Barcode ID otomatis sinkron dengan Plat Nomor
      });
      showToast(editingVehicle ? 'Data mobil berhasil diperbarui!' : 'Unit mobil baru berhasil didaftarkan!', 'success');
      onCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4" style={{ maxWidth: '880px' }}>
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-light border p-1" onClick={onCancel}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h5 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
              {editingVehicle ? 'Edit Data Armada Kendaraan' : 'Formulir Pendaftaran Armada Mobil'}
            </h5>
            <small className="text-muted" style={{ fontSize: '0.72rem' }}>
              Upload Foto Barcode BBM &bull; Auto-Fill Vendor Eksternal &bull; Checklist Alat &bull; BAST (PRD 3.5)
            </small>
          </div>
        </div>
      </div>

      <div className="card-clean p-4 bg-white">
        <form onSubmit={handleSubmit}>
          {/* Section Upload Barcode Foto / Gambar */}
          <div className="p-3 bg-light rounded-3 border mb-4">
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                {/* Preview Box Barcode */}
                <div 
                  className="bg-white border rounded-2 d-flex align-items-center justify-content-center overflow-hidden position-relative shadow-2xs"
                  style={{ width: '90px', height: '90px', minWidth: '90px' }}
                >
                  {form.barcodeImage ? (
                    <img 
                      src={form.barcodeImage} 
                      alt="Barcode Preview" 
                      className="w-100 h-100 object-fit-contain p-1 cursor-pointer"
                      onClick={() => setPreviewBarcodeModal(true)}
                      title="Klik untuk membuka & memperbesar foto barcode"
                    />
                  ) : (
                    <div className="text-center text-muted p-1">
                      <QrCode size={28} className="text-secondary mb-1" />
                      <span className="d-block text-xs" style={{ fontSize: '0.62rem' }}>Foto Barcode</span>
                    </div>
                  )}
                </div>

                <div>
                  <h6 className="fw-bold text-dark mb-0.5" style={{ fontSize: '0.875rem' }}>
                    Upload Foto / Gambar Barcode BBM Unit
                  </h6>
                  <p className="text-muted small mb-2" style={{ fontSize: '0.72rem' }}>
                    Upload foto barcode fisik atau stiker Pertamina BBM unit. Foto dapat dibuka langsung untuk digunakan driver.
                  </p>

                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="d-none" 
                      id="barcode-photo-input" 
                      onChange={handleBarcodeUpload} 
                    />
                    <label 
                      htmlFor="barcode-photo-input" 
                      className="btn btn-sm btn-primary py-1 px-2.5 fw-semibold d-flex align-items-center gap-1.5 shadow-2xs"
                      style={{ fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      <Camera size={13} />
                      <span>{form.barcodeImage ? 'Ganti Foto Barcode' : 'Pilih & Upload Foto Barcode'}</span>
                    </label>

                    {form.barcodeImage && (
                      <>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-primary py-1 px-2.5 d-flex align-items-center gap-1"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => setPreviewBarcodeModal(true)}
                        >
                          <Eye size={12} />
                          <span>Buka Foto</span>
                        </button>

                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger py-1 px-2 d-flex align-items-center gap-1"
                          style={{ fontSize: '0.75rem' }}
                          onClick={handleRemoveBarcode}
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian 1: Identitas & Vendor Kepemilikan (Tanpa Kode/ID Barcode Manual) */}
          <h6 className="fw-bold text-primary mb-3 pb-1 border-bottom" style={{ fontSize: '0.8125rem' }}>
            1. Identitas &amp; Vendor Kepemilikan
          </h6>
          <div className="row g-2.5 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">Nomor Polisi (Plat) <span className="text-danger">*</span></label>
              <input 
                type="text" 
                name="plateNumber" 
                className="form-control form-control-sm form-control-clean font-mono text-uppercase fw-bold" 
                placeholder="Contoh: D 1234 ABC" 
                value={form.plateNumber} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">Merek / Tipe Mobil <span className="text-danger">*</span></label>
              <input 
                type="text" 
                name="brandModel" 
                className="form-control form-control-sm form-control-clean" 
                placeholder="Contoh: Toyota Avanza 1.3 G" 
                value={form.brandModel} 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* Vendor / Kepemilikan */}
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">Vendor / Kepemilikan</label>
              <select 
                name="vendorType" 
                className="form-select form-select-sm form-control-clean fw-semibold" 
                value={form.vendorType} 
                onChange={handleVendorTypeChange}
              >
                <option value="Kepemilikan BSM">Kepemilikan BSM (Asset Internal)</option>
                <option value="Rental / Sewa Eksternal">Rental / Sewa Eksternal</option>
              </select>
            </div>

            {/* Tim Penugasan (Otomatis Terisi Sesuai Vendor) */}
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">Tim Penugasan</label>
              <select 
                name="team" 
                className="form-select form-select-sm form-control-clean" 
                value={form.team} 
                onChange={handleChange}
              >
                <option value="Internal">Internal Operasional</option>
                <option value="External">External Mitra</option>
              </select>
            </div>

            {/* Khusus Vendor Eksternal: Input Nama Vendor Otomatis Terisi */}
            {form.vendorType === 'Rental / Sewa Eksternal' && (
              <div className="col-12">
                <div className="p-2.5 bg-warning bg-opacity-10 rounded-2 border border-warning">
                  <label className="form-label small fw-bold text-dark mb-1">Nama Perusahaan / Rekanan Vendor Eksternal</label>
                  <input 
                    type="text" 
                    name="vendorName" 
                    className="form-control form-control-sm form-control-clean" 
                    placeholder="Contoh: PT Rental Prima Nusantara / Mitra Auto" 
                    value={form.vendorName} 
                    onChange={handleChange} 
                  />
                  <small className="text-muted d-block mt-1" style={{ fontSize: '0.68rem' }}>
                    💡 <em>Tim penugasan otomatis diset ke <strong>External Mitra</strong> untuk unit sewa/rental eksternal.</em>
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* Bagian 2: Operasional & Driver */}
          <h6 className="fw-bold text-primary mb-3 pb-1 border-bottom" style={{ fontSize: '0.8125rem' }}>
            2. Driver &amp; Status Operasional
          </h6>
          <div className="row g-2.5 mb-4">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Nama Pengemudi Utama</label>
              <input type="text" name="driverName" className="form-control form-control-sm form-control-clean" placeholder="Nama driver" value={form.driverName} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Nomor WhatsApp Driver</label>
              <input type="text" name="driverWhatsapp" className="form-control form-control-sm form-control-clean font-mono" placeholder="0812xxxxxxxx" value={form.driverWhatsapp} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Status Ketersediaan</label>
              <select name="status" className="form-select form-select-sm form-control-clean" value={form.status} onChange={handleChange}>
                <option value="Tersedia">Tersedia</option>
                <option value="Dipakai">Dipakai (Dalam Tugas)</option>
                <option value="Servis">Servis / Perbaikan</option>
              </select>
            </div>
          </div>

          {/* Bagian 3: Checklist Kelengkapan Alat (PRD 3.5) */}
          <h6 className="fw-bold text-primary mb-3 pb-1 border-bottom" style={{ fontSize: '0.8125rem' }}>
            3. Checklist Pemeriksaan Kelengkapan Alat
          </h6>
          <div className="row g-2.5 mb-4">
            <div className="col-6 col-md-3">
              <div className="p-2.5 bg-light rounded-2 border d-flex align-items-center gap-2">
                <input type="checkbox" name="hasSpareTire" className="form-check-input" id="check-ban" checked={form.hasSpareTire} onChange={handleChange} />
                <label htmlFor="check-ban" className="form-check-label small fw-semibold text-dark cursor-pointer">Ban Serep</label>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2.5 bg-light rounded-2 border d-flex align-items-center gap-2">
                <input type="checkbox" name="hasJack" className="form-check-input" id="check-dongkrak" checked={form.hasJack} onChange={handleChange} />
                <label htmlFor="check-dongkrak" className="form-check-label small fw-semibold text-dark cursor-pointer">Dongkrak</label>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2.5 bg-light rounded-2 border d-flex align-items-center gap-2">
                <input type="checkbox" name="hasWheelWrench" className="form-check-input" id="check-kunci" checked={form.hasWheelWrench} onChange={handleChange} />
                <label htmlFor="check-kunci" className="form-check-label small fw-semibold text-dark cursor-pointer">Kunci Roda</label>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2.5 bg-light rounded-2 border d-flex align-items-center gap-2">
                <input type="checkbox" name="hasFirstAidKit" className="form-check-input" id="check-p3k" checked={form.hasFirstAidKit} onChange={handleChange} />
                <label htmlFor="check-p3k" className="form-check-label small fw-semibold text-dark cursor-pointer">Kotak P3K</label>
              </div>
            </div>
          </div>

          {/* Bagian 4: Dokumentasi BAST */}
          <h6 className="fw-bold text-primary mb-3 pb-1 border-bottom" style={{ fontSize: '0.8125rem' }}>
            4. Dokumentasi Berita Acara Serah Terima (BAST)
          </h6>
          <div className="mb-4">
            <div className="p-3 bg-light rounded-2 border text-center">
              <input type="file" className="d-none" id="doc-bast" onChange={handleFileUpload} />
              <label htmlFor="doc-bast" className="btn btn-sm btn-outline-primary py-1 px-3 text-xs mb-1">
                <UploadCloud size={13} className="me-1" />
                {form.docBast ? 'Ganti Berkas BAST' : 'Upload Berkas BAST (PDF / Scan)'}
              </label>
              {form.docBast && <small className="text-muted d-block text-truncate font-mono mt-1">{form.docBast}</small>}
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button type="button" className="btn btn-sm btn-light border px-3 font-semibold" onClick={onCancel}>
              Batal
            </button>
            <button type="submit" className="btn btn-sm btn-primary px-4 fw-semibold shadow-2xs" disabled={saving}>
              <span>{saving ? 'Menyimpan...' : 'Simpan Data Armada'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal Preview / Lightbox Barcode */}
      {previewBarcodeModal && form.barcodeImage && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden bg-dark text-white">
              <div className="modal-header border-secondary py-2 px-3">
                <h6 className="modal-title fw-bold mb-0 text-white" style={{ fontSize: '0.875rem' }}>
                  Foto Barcode BBM Unit: {form.plateNumber || 'Armada'}
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewBarcodeModal(false)}></button>
              </div>
              <div className="modal-body p-4 text-center bg-white d-flex align-items-center justify-content-center">
                <img 
                  src={form.barcodeImage} 
                  alt="Barcode BBM Full" 
                  className="img-fluid rounded" 
                  style={{ maxHeight: '60vh', objectFit: 'contain' }} 
                />
              </div>
              <div className="modal-footer border-secondary py-1.5 px-3 justify-content-between">
                <span className="text-secondary small font-mono">{form.plateNumber}</span>
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setPreviewBarcodeModal(false)}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
