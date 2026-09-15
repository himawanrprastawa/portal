import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UploadCloud, ArrowLeft, Camera, Trash2, Calendar, AlertCircle, Clock, CheckCircle2, UserCheck, Coffee, UserX } from 'lucide-react';

const DIVISION_BY_TYPE = {
  'Field Worker': ['Member', 'Engineering', 'Team Leader'],
  'Back Office': ['HRD', 'Finance', 'Project']
};

export default function EmployeeForm({ editingEmployee, onSave, onCancel, existingEmployees }) {
  const { showToast, formatCurrency } = useAuth();
  
  // Calculate next sequential BST-0001 ID
  const generateNextId = () => {
    let maxNum = 0;
    (existingEmployees || []).forEach(e => {
      const match = (e.nip || e.nik || '').match(/BST-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    if (maxNum === 0) {
      maxNum = (existingEmployees || []).length;
    }
    const next = maxNum + 1;
    return `BST-${String(next).padStart(4, '0')}`;
  };

  const [form, setForm] = useState({
    // Identitas & Kependudukan (PRD 3.4)
    nip: '',
    name: '',
    birthPlace: '',
    birthDate: '',
    ktpNik: '',
    address: '',
    
    // Kepegawaian & Finansial
    position: 'Staff',
    department: 'Member',
    employeeType: 'Field Worker', // Field Worker / Back Office
    
    // Status Kepegawaian: Aktif, Cuti, Resign
    status: 'Aktif',
    leaveStartDate: '',
    leaveEndDate: '',
    leaveNotes: '',
    
    // PKWT (3, 6, 9, 12 Bulan)
    pkwtDate: new Date().toISOString().split('T')[0],
    pkwtDurationMonths: 12,
    pkwtEndDate: '',
    
    baseSalary: '',
    bankAccount: '',
    bankName: 'BCA',

    // Jaminan Sosial & Kontak Darurat (3 Kolom)
    bpjsTk: '',
    bpjsKs: '',
    emergencyContactWife: '',
    emergencyContactFather: '',
    emergencyContactMother: '',

    // 7 Dokumen Berkas
    docKtp: '',
    docKk: '',
    docCv: '',
    docTkpk1: '',
    docFirstAid: '',
    docBasicElectric: '',
    docPhoto: '',
    photo_preview: null
  });

  const [saving, setSaving] = useState(false);

  // Helper to calculate end date
  const calculateEndDate = (startDateStr, durationMonths) => {
    if (!startDateStr) return '';
    try {
      const d = new Date(startDateStr);
      d.setMonth(d.getMonth() + parseInt(durationMonths, 10));
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  // Helper to calculate remaining days
  const getDaysRemaining = (endDateStr) => {
    if (!endDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    if (editingEmployee) {
      const dur = editingEmployee.pkwtDurationMonths || editingEmployee.pkwt_duration_months || 12;
      const start = editingEmployee.pkwtDate || editingEmployee.pkwt_date || new Date().toISOString().split('T')[0];
      const end = editingEmployee.pkwtEndDate || editingEmployee.pkwt_end_date || calculateEndDate(start, dur);
      
      const empType = editingEmployee.employeeType || editingEmployee.employee_type || 'Field Worker';
      const availableDepts = DIVISION_BY_TYPE[empType] || DIVISION_BY_TYPE['Field Worker'];
      let dept = editingEmployee.department;
      if (!dept || !availableDepts.includes(dept)) {
        dept = availableDepts[0];
      }

      setForm(prev => ({
        ...prev,
        ...editingEmployee,
        employeeType: empType,
        department: dept,
        nip: editingEmployee.nip || editingEmployee.nik || '',
        pkwtDate: start,
        pkwtDurationMonths: dur,
        pkwtEndDate: end,
        leaveStartDate: editingEmployee.leaveStartDate || editingEmployee.leave_start_date || '',
        leaveEndDate: editingEmployee.leaveEndDate || editingEmployee.leave_end_date || '',
        leaveNotes: editingEmployee.leaveNotes || editingEmployee.leave_notes || '',
        photo_preview: editingEmployee.photo_preview || editingEmployee.photo_url || null
      }));
    } else {
      // Auto-generate BST-0001 for new employee
      const autoId = generateNextId();
      const defaultStart = new Date().toISOString().split('T')[0];
      setForm(prev => ({
        ...prev,
        nip: autoId,
        employeeType: 'Field Worker',
        department: 'Member',
        pkwtDate: defaultStart,
        pkwtDurationMonths: 12,
        pkwtEndDate: calculateEndDate(defaultStart, 12)
      }));
    }
  }, [editingEmployee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // When employeeType changes, dynamically adjust department to valid option
      if (name === 'employeeType') {
        const availableDepts = DIVISION_BY_TYPE[value] || DIVISION_BY_TYPE['Field Worker'];
        if (!availableDepts.includes(prev.department)) {
          updated.department = availableDepts[0];
        }
      }

      if (name === 'pkwtDate' || name === 'pkwtDurationMonths') {
        const start = name === 'pkwtDate' ? value : prev.pkwtDate;
        const dur = name === 'pkwtDurationMonths' ? value : prev.pkwtDurationMonths;
        updated.pkwtEndDate = calculateEndDate(start, dur);
      }
      return updated;
    });
  };

  const handleStatusSelect = (newStatus) => {
    setForm(prev => ({
      ...prev,
      status: newStatus,
      // Default leave dates if Cuti is chosen
      leaveStartDate: newStatus === 'Cuti' && !prev.leaveStartDate ? new Date().toISOString().split('T')[0] : prev.leaveStartDate,
      leaveEndDate: newStatus === 'Cuti' && !prev.leaveEndDate ? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] : prev.leaveEndDate
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({
          ...prev,
          docPhoto: file.name,
          photo_preview: ev.target.result,
          photo_url: ev.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({
          ...prev,
          [fieldName]: file.name,
          [`${fieldName}_url`]: ev.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setForm(prev => ({
      ...prev,
      docPhoto: '',
      photo_preview: null,
      photo_url: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.nip) {
      showToast('Harap lengkapi ID Karyawan dan nama karyawan.', 'error');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...form,
        nik: form.nip
      });
      onCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const remainingDays = getDaysRemaining(form.pkwtEndDate);

  return (
    <div className="container-fluid py-3 px-3 px-md-4" style={{ maxWidth: '920px' }}>
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-light border p-1" onClick={onCancel}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h5 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
              {editingEmployee ? 'Edit Data Karyawan' : 'Formulir Pendaftaran Karyawan (HRD)'}
            </h5>
            <small className="text-muted" style={{ fontSize: '0.72rem' }}>
              ID Otomatis BST-XXXX &bull; PKWT (3, 6, 9, 12 Bulan) &bull; Status Kepegawaian (Aktif, Cuti, Resign)
            </small>
          </div>
        </div>
      </div>

      <div className="card-clean p-4 bg-white">
        <form onSubmit={handleSubmit}>
          {/* Top Circular Photo Upload Section */}
          <div className="d-flex flex-column flex-sm-row align-items-center gap-3 p-3 bg-light rounded-3 border mb-4">
            <div className="position-relative">
              <div 
                className="rounded-circle bg-white border border-2 border-primary d-flex align-items-center justify-content-center overflow-hidden shadow-xs"
                style={{ width: '90px', height: '90px', minWidth: '90px' }}
              >
                {form.photo_preview ? (
                  <img 
                    src={form.photo_preview} 
                    alt="Foto Profil" 
                    className="w-100 h-100 object-fit-cover" 
                  />
                ) : (
                  <div className="text-center text-muted p-2">
                    <Camera size={24} className="text-secondary mb-1" />
                    <span className="d-block text-xs" style={{ fontSize: '0.62rem' }}>Pas Foto</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center text-sm-start flex-grow-1">
              <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.875rem' }}>Pas Foto Diri Karyawan</h6>
              <p className="text-muted small mb-2" style={{ fontSize: '0.72rem' }}>
                Upload foto formal berlatar belakang polos (format JPG / PNG). Foto langsung ditampilkan berbentuk lingkaran.
              </p>
              
              <div className="d-flex align-items-center gap-2 justify-content-center justify-content-sm-start flex-wrap">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="d-none" 
                  id="top-photo-input" 
                  onChange={handlePhotoUpload} 
                />
                <label 
                  htmlFor="top-photo-input" 
                  className="btn btn-sm btn-primary py-1 px-3 fw-semibold d-flex align-items-center gap-1.5 shadow-2xs"
                  style={{ fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  <Camera size={13} />
                  <span>{form.photo_preview ? 'Ganti Foto Diri' : 'Pilih & Upload Foto Diri'}</span>
                </label>

                {form.photo_preview && (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-danger py-1 px-2.5 d-flex align-items-center gap-1"
                    style={{ fontSize: '0.75rem' }}
                    onClick={handleRemovePhoto}
                  >
                    <Trash2 size={12} />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bagian 1: Identitas & Kependudukan */}
          <h6 className="fw-bold text-primary mb-3 pb-1 border-bottom" style={{ fontSize: '0.8125rem' }}>
            1. Identitas &amp; Kependudukan
          </h6>
          <div className="row g-2.5 mb-4">
            {/* Auto ID Karyawan (BST-0001) */}
            <div className="col-12 col-md-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold text-dark mb-0">ID Karyawan (NIP) <span className="text-danger">*</span></label>
                <span className="badge-soft badge-soft-primary" style={{ fontSize: '0.62rem' }}>Otomatis BST-XXXX</span>
              </div>
              <input 
                type="text" 
                name="nip" 
                className="form-control form-control-sm form-control-clean font-mono fw-bold text-primary" 
                placeholder="BST-0001" 
                value={form.nip} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="col-12 col-md-8">
              <label className="form-label small fw-bold text-dark mb-1">Nama Lengkap Karyawan <span className="text-danger">*</span></label>
              <input type="text" name="name" className="form-control form-control-sm form-control-clean" placeholder="Nama lengkap sesuai KTP" value={form.name} onChange={handleChange} required />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Tempat Lahir</label>
              <input type="text" name="birthPlace" className="form-control form-control-sm form-control-clean" placeholder="Bandung" value={form.birthPlace} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Tanggal Lahir</label>
              <input type="date" name="birthDate" className="form-control form-control-sm form-control-clean" value={form.birthDate} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Nomor KTP (NIK)</label>
              <input type="text" name="ktpNik" className="form-control form-control-sm form-control-clean font-mono" placeholder="3204xxxxxxxxxx" value={form.ktpNik} onChange={handleChange} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold text-dark mb-1">Alamat Lengkap Domisili</label>
              <textarea name="address" className="form-control form-control-sm form-control-clean" rows="2" placeholder="Alamat jalan, kelurahan, kecamatan, kota..." value={form.address} onChange={handleChange} />
            </div>
          </div>

          {/* Bagian 2: Kepegawaian, Kontrak PKWT & Status Karyawan (Point 5 Buttons) */}
          <h6 className="fw-bold text-primary mb-3 pb-1 border-bottom" style={{ fontSize: '0.8125rem' }}>
            2. Kepegawaian &amp; Status Karyawan
          </h6>
          <div className="row g-2.5 mb-4">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Tipe Karyawan <span className="text-danger">*</span></label>
              <select 
                name="employeeType" 
                className="form-select form-select-sm form-control-clean fw-semibold" 
                value={form.employeeType} 
                onChange={handleChange}
              >
                <option value="Field Worker">Field Worker (Lapangan)</option>
                <option value="Back Office">Back Office (Kantor)</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">
                Divisi / Departemen <span className="text-danger">*</span>
              </label>
              <select 
                name="department" 
                className="form-select form-select-sm form-control-clean fw-bold text-primary" 
                value={form.department} 
                onChange={handleChange}
              >
                {(DIVISION_BY_TYPE[form.employeeType] || DIVISION_BY_TYPE['Field Worker']).map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Jabatan Struktural</label>
              <input 
                type="text" 
                name="position" 
                className="form-control form-control-sm form-control-clean" 
                placeholder="Contoh: Staff / Supervisor" 
                value={form.position} 
                onChange={handleChange} 
              />
            </div>

            {/* Point 5: Status Karyawan Buttons (Aktif, Cuti, Resign) */}
            <div className="col-12">
              <label className="form-label small fw-bold text-dark mb-1.5 d-block">Status Karyawan Saat Ini <span className="text-danger">*</span></label>
              <div className="btn-group w-100 p-1 bg-light rounded-2 border" role="group">
                <button 
                  type="button" 
                  className={`btn btn-sm py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-1.5 ${form.status === 'Aktif' ? 'btn-success text-white shadow-2xs' : 'btn-light border-0 text-muted'}`}
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => handleStatusSelect('Aktif')}
                >
                  <UserCheck size={14} />
                  <span>1. Status Aktif</span>
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-1.5 ${form.status === 'Cuti' ? 'btn-warning text-dark shadow-2xs font-bold' : 'btn-light border-0 text-muted'}`}
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => handleStatusSelect('Cuti')}
                >
                  <Coffee size={14} />
                  <span>2. Sedang Cuti (Masa Waktu)</span>
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm py-1.5 fw-semibold d-flex align-items-center justify-content-center gap-1.5 ${form.status === 'Resign' ? 'btn-danger text-white shadow-2xs' : 'btn-light border-0 text-muted'}`}
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => handleStatusSelect('Resign')}
                >
                  <UserX size={14} />
                  <span>3. Resign / Non-Aktif</span>
                </button>
              </div>
            </div>

            {/* Khusus Cuti: Masa Waktu Cuti Inputs */}
            {form.status === 'Cuti' && (
              <div className="col-12">
                <div className="p-3 bg-warning bg-opacity-10 rounded-2 border border-warning">
                  <div className="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-warning border-opacity-25">
                    <Coffee size={16} className="text-warning-emphasis" />
                    <strong className="text-dark" style={{ fontSize: '0.8rem' }}>Pengaturan Masa Waktu Cuti Karyawan</strong>
                  </div>

                  <div className="row g-2">
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold text-dark mb-1">Tanggal Mulai Cuti</label>
                      <input 
                        type="date" 
                        name="leaveStartDate" 
                        className="form-control form-control-sm form-control-clean"
                        value={form.leaveStartDate} 
                        onChange={handleChange} 
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold text-dark mb-1">Tanggal Selesai Cuti</label>
                      <input 
                        type="date" 
                        name="leaveEndDate" 
                        className="form-control form-control-sm form-control-clean"
                        value={form.leaveEndDate} 
                        onChange={handleChange} 
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-bold text-dark mb-1">Keterangan / Alasan Cuti</label>
                      <input 
                        type="text" 
                        name="leaveNotes" 
                        className="form-control form-control-sm form-control-clean"
                        placeholder="Contoh: Cuti Tahunan / Melahirkan"
                        value={form.leaveNotes} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                  <small className="text-muted d-block mt-2" style={{ fontSize: '0.7rem' }}>
                    💡 <em>Otomatisasi Sistem: Status karyawan akan otomatis kembali menjadi <strong>Aktif</strong> begitu tanggal selesai cuti terlewati.</em>
                  </small>
                </div>
              </div>
            )}

            {/* Tanggal Mulai PKWT & Durasi 3,6,9,12 Bulan */}
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">Tanggal Mulai PKWT <span className="text-danger">*</span></label>
              <input 
                type="date" 
                name="pkwtDate" 
                className="form-control form-control-sm form-control-clean" 
                value={form.pkwtDate} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">Durasi Kontrak PKWT <span className="text-danger">*</span></label>
              <select 
                name="pkwtDurationMonths" 
                className="form-select form-select-sm form-control-clean fw-semibold"
                value={form.pkwtDurationMonths} 
                onChange={handleChange}
              >
                <option value="3">3 Bulan</option>
                <option value="6">6 Bulan</option>
                <option value="9">9 Bulan</option>
                <option value="12">12 Bulan (1 Tahun)</option>
              </select>
            </div>

            {/* Live Calculation: Tanggal Berakhir & H-30 Alert Banner */}
            <div className="col-12">
              <div className={`p-2.5 rounded-2 border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 ${
                remainingDays !== null && remainingDays <= 30 && remainingDays >= 0 ? 'bg-warning bg-opacity-15 border-warning' :
                remainingDays !== null && remainingDays < 0 ? 'bg-danger bg-opacity-15 border-danger' :
                'bg-light'
              }`} style={{ fontSize: '0.75rem' }}>
                <div className="d-flex align-items-center gap-2">
                  <Clock size={16} className={
                    remainingDays !== null && remainingDays <= 30 ? 'text-warning-emphasis' : 'text-primary'
                  } />
                  <div>
                    <span className="text-muted">Tanggal Berakhir Kontrak: </span>
                    <strong className="text-dark font-mono">{form.pkwtEndDate || '-'}</strong>
                  </div>
                </div>

                <div>
                  {remainingDays !== null && (
                    <span className={`badge ${
                      remainingDays < 0 ? 'bg-danger text-white' :
                      remainingDays <= 30 ? 'bg-warning text-dark font-black animate-pulse' :
                      'badge-soft badge-soft-success'
                    }`}>
                      {remainingDays < 0 ? `❌ Kontrak Berakhir (${Math.abs(remainingDays)} hari lalu)` :
                       remainingDays <= 30 ? `⚠️ Peringatan: H-${remainingDays} Hari Lagi Berakhir` :
                       `✓ Aktif (${remainingDays} hari lagi)`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Gaji & Bank */}
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Gaji Pokok (IDR)</label>
              <input type="number" name="baseSalary" className="form-control form-control-sm form-control-clean font-mono" placeholder="0" value={form.baseSalary} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Bank Penggajian</label>
              <select name="bankName" className="form-select form-select-sm form-control-clean" value={form.bankName} onChange={handleChange}>
                <option value="BCA">BCA</option>
                <option value="Mandiri">Bank Mandiri</option>
                <option value="BRI">BRI</option>
                <option value="BNI">BNI</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Nomor Rekening</label>
              <input type="text" name="bankAccount" className="form-control form-control-sm form-control-clean font-mono" placeholder="Nomor rekening bank" value={form.bankAccount} onChange={handleChange} />
            </div>
          </div>

          {/* Bagian 3: Jaminan Sosial & Kontak Darurat 3 Kolom */}
          <h6 className="fw-bold text-primary mb-3 pb-1 border-bottom" style={{ fontSize: '0.8125rem' }}>
            3. Jaminan Sosial &amp; Kontak Darurat (3 Kolom Sesuai PRD)
          </h6>
          <div className="row g-2.5 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">No. BPJS Ketenagakerjaan (TK)</label>
              <input type="text" name="bpjsTk" className="form-control form-control-sm form-control-clean font-mono" placeholder="Nomor BPJS TK" value={form.bpjsTk} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">No. BPJS Kesehatan (KS)</label>
              <input type="text" name="bpjsKs" className="form-control form-control-sm form-control-clean font-mono" placeholder="Nomor BPJS KS" value={form.bpjsKs} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Kontak Darurat Istri/Pasangan</label>
              <input type="text" name="emergencyContactWife" className="form-control form-control-sm form-control-clean font-mono" placeholder="0812xxxxxxxx" value={form.emergencyContactWife} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Kontak Darurat Ayah</label>
              <input type="text" name="emergencyContactFather" className="form-control form-control-sm form-control-clean font-mono" placeholder="0813xxxxxxxx" value={form.emergencyContactFather} onChange={handleChange} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Kontak Darurat Ibu</label>
              <input type="text" name="emergencyContactMother" className="form-control form-control-sm form-control-clean font-mono" placeholder="0814xxxxxxxx" value={form.emergencyContactMother} onChange={handleChange} />
            </div>
          </div>

          {/* Bagian 4: Unggah Berkas (6 Dokumen Tambahan Sesuai PRD 3.4) */}
          <h6 className="fw-bold text-primary mb-3 pb-1 border-bottom" style={{ fontSize: '0.8125rem' }}>
            4. Unggah Berkas &amp; Dokumen Pendukung (Foto KTP, KK, CV, Sertifikat)
          </h6>
          <div className="row g-2 mb-4">
            {[
              { id: 'docKtp', label: '1. Foto KTP' },
              { id: 'docKk', label: '2. Foto Kartu Keluarga (KK)' },
              { id: 'docCv', label: '3. CV Karyawan' },
              { id: 'docTkpk1', label: '4. Sertifikat TKPK 1' },
              { id: 'docFirstAid', label: '5. Sertifikat First Aid (P3K)' },
              { id: 'docBasicElectric', label: '6. Sertifikat Basic Electric' }
            ].map(doc => (
              <div key={doc.id} className="col-12 col-sm-6 col-md-4">
                <div className="p-2.5 bg-light rounded-2 border text-center">
                  <span className="fw-bold d-block text-dark mb-1" style={{ fontSize: '0.72rem' }}>{doc.label}</span>
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    className="d-none" 
                    id={doc.id} 
                    onChange={(e) => handleDocumentUpload(e, doc.id)} 
                  />
                  <label htmlFor={doc.id} className="btn btn-sm btn-outline-secondary py-0.5 px-2 text-xs w-100 mb-1">
                    {form[doc.id] ? 'Ganti Berkas' : 'Pilih Berkas'}
                  </label>
                  {form[doc.id] && (
                    <small className="text-muted d-block text-truncate font-mono" style={{ fontSize: '0.65rem' }}>
                      ✓ {form[doc.id]}
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button type="button" className="btn btn-sm btn-light border px-3 font-semibold" onClick={onCancel}>
              Batal
            </button>
            <button type="submit" className="btn btn-sm btn-primary px-4 fw-semibold shadow-2xs" disabled={saving}>
              <span>{saving ? 'Menyimpan...' : 'Simpan Data Karyawan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
