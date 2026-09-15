import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Fuel, UploadCloud, CheckCircle2, AlertCircle, Camera, ShieldCheck, Clock, Check, Car } from 'lucide-react';

export default function UserBBM({ onSaveBbmExpense, onValidateExpense, vehicles = [], expenses = [] }) {
  const { currentUser, showToast } = useAuth();

  const myName = currentUser?.employee_name || currentUser?.username || 'Driver Lapangan';

  // Find vehicle assigned to this driver
  const myAssignedVehicle = (vehicles || []).find(v => {
    const dName = (v.driverName || v.driver_name || '').toLowerCase();
    const currName = myName.toLowerCase();
    const currUser = (currentUser?.username || '').toLowerCase();
    return dName && (dName === currName || dName.includes(currUser) || currName.includes(dName));
  });

  const defaultPlate = myAssignedVehicle 
    ? (myAssignedVehicle.plateNumber || myAssignedVehicle.plate_number) 
    : ((vehicles && vehicles[0]) ? (vehicles[0].plateNumber || vehicles[0].plate_number) : 'B 1234 ABC');

  const [activeTask, setActiveTask] = useState(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    plateNumber: defaultPlate,
    driverName: myName,
    odometerKm: '',
    fuelType: 'Pertalite',
    amount: '',
    photoStruk: '',
    photoStrukPreview: null,
    photoOdometer: '',
    photoOdometerPreview: null,
    photoDispenser: '',
    photoDispenserPreview: null,
    notes: ''
  });

  const [saving, setSaving] = useState(false);

  // Sync plate & driver when vehicles load or user changes
  useEffect(() => {
    if (myAssignedVehicle) {
      const plate = myAssignedVehicle.plateNumber || myAssignedVehicle.plate_number;
      setForm(prev => ({
        ...prev,
        plateNumber: plate,
        driverName: myName
      }));
    }
  }, [vehicles, currentUser]);

  // Filter pending BBM validation tasks assigned to this driver or matching plate
  const pendingTasks = (expenses || []).filter(exp => {
    const isBbm = exp.category === 'BBM' || (exp.description && exp.description.toLowerCase().includes('bbm'));
    const isPending = exp.status === 'Belum Divalidasi';
    if (!isBbm || !isPending) return false;

    // Master, Finance, & HRD see all pending BBM
    if (['Master', 'Finance', 'HRD'].includes(currentUser?.role)) return true;

    const pic = (exp.pic_name || exp.recipient_name || '').toLowerCase();
    const desc = (exp.description || '').toLowerCase();
    const userLower = myName.toLowerCase();
    const userAcc = (currentUser?.username || '').toLowerCase();
    const myPlateLower = (myAssignedVehicle?.plateNumber || myAssignedVehicle?.plate_number || '').toLowerCase();

    return pic.includes(userLower) || pic.includes(userAcc) || userLower.includes(pic) ||
      (myPlateLower && desc.includes(myPlateLower));
  });

  const handleSelectTask = (task) => {
    setActiveTask(task);

    // Extract plate from description if present (e.g. [B 1234 ABC])
    let detectedPlate = defaultPlate;
    const match = (task.description || '').match(/\[([A-Za-z0-9\s]+)\]/);
    if (match && match[1]) {
      detectedPlate = match[1].trim();
    }

    setForm(prev => ({
      ...prev,
      date: task.date || prev.date,
      amount: task.amount ? String(task.amount) : prev.amount,
      plateNumber: detectedPlate,
      driverName: task.recipient_name || task.pic_name || myName,
      notes: task.description || ''
    }));

    showToast(`Memuat tugas validasi nota ${task.code || ''}. Lengkapi 3 foto bukti.`, 'info');
  };

  const handleCancelTask = () => {
    setActiveTask(null);
    setForm(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0],
      plateNumber: defaultPlate,
      driverName: myName,
      amount: '',
      notes: ''
    }));
  };

  const handleFileUpload = (e, fieldName, previewField) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({
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
    if (!form.odometerKm || !form.amount) {
      showToast('Harap lengkapi angka kilometer odometer dan nominal pengisian.', 'error');
      return;
    }
    if (!form.photoStruk && !form.photoOdometer && !form.photoDispenser) {
      showToast('Harap upload setidaknya foto struk dan odometer untuk validasi.', 'warning');
    }

    setSaving(true);
    try {
      if (activeTask && onValidateExpense) {
        // Validating an existing task from Finance
        await onValidateExpense(activeTask.id, {
          date: form.date,
          amount: parseFloat(form.amount) || activeTask.amount,
          driverName: form.driverName,
          photoStruk: form.photoStrukPreview || form.photoStruk,
          photoOdometer: form.photoOdometerPreview || form.photoOdometer,
          photoDispenser: form.photoDispenserPreview || form.photoDispenser,
          notes: `KM: ${form.odometerKm} | BBM: ${form.fuelType} | Catatan: ${form.notes || '-'}`
        });
        setActiveTask(null);
      } else {
        // Submitting a direct BBM claim
        await onSaveBbmExpense({
          ...form,
          category: 'BBM',
          amount: parseFloat(form.amount) || 0,
          recipient_name: form.driverName,
          pic_name: form.driverName,
          description: `[${form.plateNumber}] KM: ${form.odometerKm} (${form.fuelType}) - ${form.notes || 'Pengisian BBM Lapangan'}`,
          status: 'Sudah Divalidasi',
          photoStruk: form.photoStrukPreview || form.photoStruk,
          photoOdometer: form.photoOdometerPreview || form.photoOdometer,
          photoDispenser: form.photoDispenserPreview || form.photoDispenser,
        });
        showToast('Klaim BBM & 3 Foto Bukti berhasil disimpan dan divalidasi!', 'success');
      }

      setForm(prev => ({
        ...prev,
        odometerKm: '',
        amount: '',
        photoStruk: '',
        photoStrukPreview: null,
        photoOdometer: '',
        photoOdometerPreview: null,
        photoDispenser: '',
        photoDispenserPreview: null,
        notes: ''
      }));
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses validasi BBM.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4 fade-in" style={{ maxWidth: '850px' }}>
      {/* Header Banner */}
      <div className="d-flex align-items-center justify-content-between mb-4 bg-white p-3 p-md-4 rounded-3 border shadow-xs">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="h5 fw-bold text-dark mb-0">Validasi Pengisian BBM (Standard 3 Foto)</h2>
            <span className="badge bg-primary bg-opacity-10 text-primary fw-bold" style={{ fontSize: '0.72rem' }}>
              User Lapangan / Driver
            </span>
          </div>
          <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
            Autentikasi pengisian BBM dengan 3 foto wajib: <strong>Struk BBM + Odometer Sebelum Pengisian + Odometer Sesudah Pengisian</strong>.
          </p>
        </div>
        {myAssignedVehicle && (
          <div className="d-none d-md-flex align-items-center gap-2 bg-light p-2 rounded-2 border">
            <Car size={18} className="text-primary" />
            <div style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
              <div className="fw-bold font-mono text-dark">{myAssignedVehicle.plateNumber || myAssignedVehicle.plate_number}</div>
              <small className="text-muted">{myAssignedVehicle.model || 'Unit Terdaftar'}</small>
            </div>
          </div>
        )}
      </div>

      {/* ANTREAN TUGAS DARI FINANCE */}
      {pendingTasks.length > 0 && (
        <div className="card border-0 shadow-xs rounded-3 bg-white mb-4 overflow-hidden border border-warning">
          <div className="p-3 bg-warning bg-opacity-10 border-bottom border-warning d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <Clock size={16} className="text-warning-emphasis" />
              <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                Antrean Tugas Validasi Nota BBM ({pendingTasks.length} Menunggu)
              </span>
            </div>
            <small className="text-muted" style={{ fontSize: '0.72rem' }}>
              Ditugaskan oleh Bagian Finance
            </small>
          </div>

          <div className="p-3">
            <div className="row g-2">
              {pendingTasks.map(task => {
                const isSelected = activeTask?.id === task.id;
                return (
                  <div key={task.id} className="col-12 col-md-6">
                    <div className={`p-3 rounded-2 border transition-all ${isSelected ? 'border-primary bg-primary bg-opacity-10' : 'bg-light hover-shadow-sm'}`}>
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="badge bg-secondary text-2xs font-mono">{task.code || 'BBM'}</span>
                        <span className="fw-bold text-success font-mono" style={{ fontSize: '0.85rem' }}>
                          Rp {Number(task.amount || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="fw-semibold text-dark text-truncate mb-1" style={{ fontSize: '0.8rem' }}>
                        {task.description || 'Pengisian BBM Operasional'}
                      </div>
                      <div className="d-flex align-items-center justify-content-between pt-2 mt-2 border-top" style={{ fontSize: '0.72rem' }}>
                        <span className="text-muted">PIC: <strong>{task.recipient_name || task.pic_name || '-'}</strong></span>
                        <button 
                          type="button" 
                          className={`btn btn-xs fw-bold px-2.5 py-1 ${isSelected ? 'btn-primary text-white' : 'btn-outline-primary'}`}
                          onClick={() => isSelected ? handleCancelTask() : handleSelectTask(task)}
                        >
                          {isSelected ? 'Batal Pilih' : 'Validasi Sekarang →'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FORM VALIDASI 3 FOTO */}
      <div className="card border-0 shadow-xs rounded-3 bg-white p-4">
        {activeTask && (
          <div className="alert alert-primary py-2 px-3 mb-3 d-flex align-items-center justify-content-between rounded-2" style={{ fontSize: '0.78rem' }}>
            <div className="d-flex align-items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              <span>
                Sedang memvalidasi nota: <strong>{activeTask.code}</strong> (Rp {Number(activeTask.amount || 0).toLocaleString('id-ID')})
              </span>
            </div>
            <button type="button" className="btn btn-xs btn-light border py-0.5 px-2" onClick={handleCancelTask}>
              Batal
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark">Tanggal Pengisian <span className="text-danger">*</span></label>
              <input 
                type="date" 
                className="form-control form-control-sm form-control-clean"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark">Armada Kendaraan <span className="text-danger">*</span></label>
              <select 
                className="form-select form-select-sm form-control-clean font-mono fw-bold"
                value={form.plateNumber}
                onChange={(e) => {
                  const pNum = e.target.value;
                  const v = (vehicles || []).find(item => (item.plateNumber || item.plate_number) === pNum);
                  setForm(prev => ({
                    ...prev,
                    plateNumber: pNum,
                    driverName: v?.driverName || v?.driver_name || prev.driverName
                  }));
                }}
                required
              >
                {(vehicles || []).map(v => (
                  <option key={v.id} value={v.plateNumber || v.plate_number}>
                    {v.plateNumber || v.plate_number} {v.driverName ? `(Driver: ${v.driverName})` : ''} - {v.model || v.brandModel || 'Unit'}
                  </option>
                ))}
                {(!vehicles || vehicles.length === 0) && (
                  <option value="B 1234 ABC">B 1234 ABC (Mobil Operasional)</option>
                )}
              </select>
              <div className="form-text text-muted" style={{ fontSize: '0.72rem' }}>
                Otomatis mengikuti unit yang ditugaskan ke driver.
              </div>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark">Nama Driver / PIC</label>
              <input 
                type="text" 
                className="form-control form-control-sm form-control-clean"
                value={form.driverName}
                onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark">Kilometer Odometer (KM) <span className="text-danger">*</span></label>
              <input 
                type="number" 
                className="form-control form-control-sm form-control-clean font-mono"
                placeholder="Contoh: 45200"
                value={form.odometerKm}
                onChange={(e) => setForm({ ...form, odometerKm: e.target.value })}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark">Jenis Bahan Bakar</label>
              <select 
                className="form-select form-select-sm form-control-clean"
                value={form.fuelType}
                onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
              >
                <option value="Pertalite">Pertalite (RON 90)</option>
                <option value="Pertamax">Pertamax (RON 92)</option>
                <option value="Pertamax Turbo">Pertamax Turbo (RON 98)</option>
                <option value="Dexlite">Dexlite (Diesel)</option>
                <option value="Solar">Biosolar</option>
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">
                Total Biaya Pengisian (IDR) <span className="text-danger">*</span>
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text font-mono fw-bold bg-light text-muted" style={{ fontSize: '0.78rem' }}>
                  Rp
                </span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  className="form-control form-control-clean font-mono fw-bold text-dark"
                  placeholder="0"
                  value={form.amount ? new Intl.NumberFormat('id-ID').format(form.amount) : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setForm(prev => ({ ...prev, amount: raw ? parseInt(raw, 10) : '' }));
                  }}
                  required
                />
              </div>
              {form.amount > 0 ? (
                <div className="form-text font-mono fw-semibold text-muted d-flex align-items-center justify-content-between mt-1" style={{ fontSize: '0.72rem' }}>
                  <span className="text-warning-emphasis fw-bold">Rp {new Intl.NumberFormat('id-ID').format(form.amount)}</span>
                  <span className="badge bg-light text-secondary border">{String(form.amount).length} digit</span>
                </div>
              ) : (
                <div className="form-text text-muted" style={{ fontSize: '0.7rem' }}>
                  Format titik ribuan otomatis muncul saat mengetik.
                </div>
              )}
            </div>

            <div className="col-12">
              <label className="form-label small fw-bold text-dark">Catatan Perjalanan / SPBU (Opsional)</label>
              <input 
                type="text" 
                className="form-control form-control-sm form-control-clean"
                placeholder="Contoh: Pengisian di SPBU KM 57 Tol Jakarta-Cikampek rute tugas site..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          {/* 3 Photos Upload Requirements */}
          <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <span>Wajib Upload 3 Foto Validasi Standar Lapangan:</span>
          </h6>

          <div className="row g-3 mb-4 align-items-stretch">
            {/* Foto 1: Struk BBM */}
            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 border text-center h-100 d-flex flex-column justify-content-between">
                <div>
                  <span className="small fw-bold d-block text-dark" style={{ minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                    1. Foto Struk BBM
                  </span>
                  <small className="text-muted d-block text-xs mt-1" style={{ minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Struk cetak resmi nominal &amp; liter SPBU
                  </small>
                </div>
                <div className="mt-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="d-none" 
                    id="bbm-struk"
                    onChange={(e) => handleFileUpload(e, 'photoStruk', 'photoStrukPreview')}
                  />
                  <label htmlFor="bbm-struk" className="btn btn-outline-primary btn-sm w-100 py-1.5 text-xs fw-semibold d-flex align-items-center justify-content-center gap-1.5">
                    <Camera size={14} />
                    <span>Upload Foto</span>
                  </label>
                  {form.photoStrukPreview && (
                    <div className="mt-2 text-center">
                      <img src={form.photoStrukPreview} alt="Struk BBM" className="img-thumbnail rounded-2 shadow-2xs" style={{ height: '80px', width: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Foto 2: Odometer Sebelum Pengisian */}
            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 border text-center h-100 d-flex flex-column justify-content-between">
                <div>
                  <span className="small fw-bold d-block text-dark" style={{ minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                    2. Foto Odometer Sebelum Pengisian
                  </span>
                  <small className="text-muted d-block text-xs mt-1" style={{ minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Dashboard speedometer sebelum isi BBM
                  </small>
                </div>
                <div className="mt-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="d-none" 
                    id="bbm-odo"
                    onChange={(e) => handleFileUpload(e, 'photoOdometer', 'photoOdometerPreview')}
                  />
                  <label htmlFor="bbm-odo" className="btn btn-outline-info btn-sm w-100 py-1.5 text-xs fw-semibold d-flex align-items-center justify-content-center gap-1.5">
                    <Camera size={14} />
                    <span>Upload Foto</span>
                  </label>
                  {form.photoOdometerPreview && (
                    <div className="mt-2 text-center">
                      <img src={form.photoOdometerPreview} alt="Odometer Sebelum" className="img-thumbnail rounded-2 shadow-2xs" style={{ height: '80px', width: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Foto 3: Odometer Sesudah Pengisian */}
            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 border text-center h-100 d-flex flex-column justify-content-between">
                <div>
                  <span className="small fw-bold d-block text-dark" style={{ minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                    3. Foto Odometer Sesudah Pengisian
                  </span>
                  <small className="text-muted d-block text-xs mt-1" style={{ minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Dashboard speedometer sesudah isi BBM
                  </small>
                </div>
                <div className="mt-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="d-none" 
                    id="bbm-dispenser"
                    onChange={(e) => handleFileUpload(e, 'photoDispenser', 'photoDispenserPreview')}
                  />
                  <label htmlFor="bbm-dispenser" className="btn btn-outline-success btn-sm w-100 py-1.5 text-xs fw-semibold d-flex align-items-center justify-content-center gap-1.5">
                    <Camera size={14} />
                    <span>Upload Foto</span>
                  </label>
                  {form.photoDispenserPreview && (
                    <div className="mt-2 text-center">
                      <img src={form.photoDispenserPreview} alt="Odometer Sesudah" className="img-thumbnail rounded-2 shadow-2xs" style={{ height: '80px', width: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            {activeTask && (
              <button type="button" className="btn btn-light btn-sm px-3" onClick={handleCancelTask}>
                Batal
              </button>
            )}
            <button type="submit" className="btn btn-warning btn-sm px-4 fw-bold shadow-sm d-flex align-items-center gap-1.5" disabled={saving}>
              <Fuel size={16} />
              <span>{saving ? 'Menyimpan...' : (activeTask ? 'Kirim Validasi Nota BBM' : 'Simpan Klaim BBM Baru')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
