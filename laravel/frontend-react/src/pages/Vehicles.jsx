import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Eye, 
  Download, 
  Camera, 
  History, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  PlusCircle, 
  FileText,
  Check
} from 'lucide-react';
import api from '../services/api';

export default function Vehicles({ 
  vehicles, 
  onSaveVehicle, 
  onDeleteVehicle, 
  onOpenAddVehicle, 
  onOpenEditVehicle 
}) {
  const { hasAccess, currentUser, showToast } = useAuth();
  const [search, setSearch] = useState('');
  const [previewBarcode, setPreviewBarcode] = useState(null);

  // Vehicle History Log State
  const [selectedVehicleForLog, setSelectedVehicleForLog] = useState(null);
  const [vehicleLogs, setVehicleLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showAddLogForm, setShowAddLogForm] = useState(false);
  const [newLogData, setNewLogData] = useState({
    driver_name: '',
    driver_whatsapp: '',
    action: 'Penugasan Unit',
    notes: '',
    start_date: new Date().toISOString().split('T')[0]
  });

  const filtered = (vehicles || []).filter(v => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (v.plateNumber && v.plateNumber.toLowerCase().includes(q)) ||
           (v.plate_number && v.plate_number.toLowerCase().includes(q)) ||
           (v.brandModel && v.brandModel.toLowerCase().includes(q)) ||
           (v.model && v.model.toLowerCase().includes(q)) ||
           (v.driverName && v.driverName.toLowerCase().includes(q)) ||
           (v.vendor && v.vendor.toLowerCase().includes(q));
  });

  // Fetch Vehicle Driver Logs when a vehicle is selected
  const handleOpenLogModal = async (veh) => {
    setSelectedVehicleForLog(veh);
    setShowAddLogForm(false);
    setNewLogData({
      driver_name: '',
      driver_whatsapp: '',
      action: 'Penugasan Unit',
      notes: '',
      start_date: new Date().toISOString().split('T')[0]
    });
    setLoadingLogs(true);
    try {
      const res = await api.getVehicleLogs(veh.id, veh.plateNumber || veh.plate_number);
      if (res && res.success) {
        setVehicleLogs(res.data || []);
      } else {
        setVehicleLogs([]);
      }
    } catch (err) {
      console.error(err);
      setVehicleLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Submit new driver log entry
  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLogData.driver_name) {
      showToast('Nama driver wajib diisi.', 'error');
      return;
    }

    try {
      const plate = selectedVehicleForLog.plateNumber || selectedVehicleForLog.plate_number;
      await api.createVehicleLog({
        vehicle_id: selectedVehicleForLog.id,
        plate_number: plate,
        driver_name: newLogData.driver_name,
        driver_whatsapp: newLogData.driver_whatsapp || '-',
        action: newLogData.action || 'Penugasan Unit',
        start_date: newLogData.start_date ? `${newLogData.start_date} 08:00:00` : new Date().toISOString().slice(0, 19).replace('T', ' '),
        notes: newLogData.notes || ''
      });

      // Update the vehicle's current driver in the main list
      await onSaveVehicle({
        ...selectedVehicleForLog,
        driverName: newLogData.driver_name,
        driver_name: newLogData.driver_name,
        driverWhatsapp: newLogData.driver_whatsapp || '-',
        driver_whatsapp: newLogData.driver_whatsapp || '-'
      });

      showToast(`Driver mobil ${plate} berhasil diperbarui ke ${newLogData.driver_name}!`, 'success');
      
      // Refresh logs
      const res = await api.getVehicleLogs(selectedVehicleForLog.id, plate);
      setVehicleLogs(res?.data || []);
      setShowAddLogForm(false);
    } catch (err) {
      console.error(err);
      showToast('Gagal mencatat riwayat driver.', 'error');
    }
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
            Armada Kendaraan Operasional
          </h5>
        </div>
        {hasAccess('Vehicle', 'create') && (
          <button 
            className="btn btn-primary btn-sm fw-semibold d-flex align-items-center gap-1.5 shadow-2xs" 
            style={{ fontSize: '0.75rem' }} 
            onClick={onOpenAddVehicle}
          >
            <Plus size={14} />
            <span>Tambah Mobil Baru</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="card-clean mb-3 p-2.5 bg-white">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-light text-muted border-end-0">
            <Search size={14} />
          </span>
          <input 
            type="text" 
            className="form-control form-control-clean border-start-0 ps-0"
            style={{ fontSize: '0.78rem' }}
            placeholder="Pencarian Kendaraan Operasional"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              className="btn btn-light border-start-0 text-muted" 
              type="button" 
              onClick={() => setSearch('')}
              title="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="row g-3">
        {filtered.map(veh => {
          const barcodeImg = veh.barcodeImage || veh.barcode_bbm || veh.barcode_image;
          const plate = veh.plateNumber || veh.plate_number;
          const model = veh.brandModel || veh.model;
          const driver = veh.driverName || veh.driver_name || 'Belum Ditugaskan';

          return (
            <div key={veh.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card-clean p-3 bg-white h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className="badge-soft badge-soft-slate font-mono fw-bold px-2 py-0.5 mb-1 d-inline-block" style={{ fontSize: '0.8rem' }}>
                      {plate}
                    </span>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.875rem' }}>{model}</h6>
                  </div>
                  <span className={`badge-soft ${
                    veh.status === 'Tersedia' ? 'badge-soft-success' :
                    veh.status === 'Dipakai' || veh.status === 'Dalam Tugas' ? 'badge-soft-warning' :
                    'badge-soft-danger'
                  }`} style={{ fontSize: '0.68rem' }}>
                    {veh.status || 'Tersedia'}
                  </span>
                </div>

                {/* Barcode & Driver Row */}
                <div className="p-2.5 bg-light rounded-2 small mb-3 flex-grow-1">
                  {/* Barcode Upload Preview */}
                  <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      {barcodeImg ? (
                        <div 
                          className="bg-white border rounded p-0.5 cursor-pointer shadow-2xs position-relative"
                          style={{ width: '42px', height: '42px', minWidth: '42px' }}
                          onClick={() => setPreviewBarcode({ title: plate, img: barcodeImg })}
                          title="Klik untuk membuka foto barcode"
                        >
                          <img 
                            src={barcodeImg} 
                            alt="Barcode" 
                            className="w-100 h-100 object-fit-contain" 
                          />
                        </div>
                      ) : (
                        <div 
                          className="bg-white border rounded d-flex align-items-center justify-content-center text-muted"
                          style={{ width: '42px', height: '42px', minWidth: '42px' }}
                        >
                          <QrCode size={18} className="text-secondary opacity-50" />
                        </div>
                      )}

                      <div>
                        <span className="text-muted d-block text-xs" style={{ fontSize: '0.65rem' }}>Foto Barcode BBM:</span>
                        <strong className="text-dark" style={{ fontSize: '0.75rem' }}>
                          {barcodeImg ? '✓ Terunggah' : 'Belum Ada Foto'}
                        </strong>
                      </div>
                    </div>

                    {barcodeImg && (
                      <button 
                        type="button" 
                        className="btn btn-sm btn-primary py-0.5 px-2 text-xs d-flex align-items-center gap-1 font-semibold"
                        onClick={() => setPreviewBarcode({ title: plate, img: barcodeImg })}
                      >
                        <Eye size={11} />
                        <span>Buka Foto</span>
                      </button>
                    )}
                  </div>

                  {/* Driver Saat Ini & Log Button */}
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted">Driver Saat Ini:</span>
                    <strong className="text-dark">{driver}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Vendor:</span>
                    <span className="text-dark font-medium">{veh.vendor || 'Kepemilikan BSM'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Kelengkapan Alat:</span>
                    <span className="text-success font-semibold text-xs">
                      {[veh.hasSpareTire && 'Ban', veh.hasJack && 'Dongkrak', veh.hasWheelWrench && 'Kunci', veh.hasFirstAidKit && 'P3K'].filter(Boolean).length}/4 Lengkap
                    </span>
                  </div>

                  {/* Button Buka Riwayat / Log Driver Unit */}
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-primary w-100 py-1 text-xs d-flex align-items-center justify-content-center gap-1.5 fw-semibold"
                    onClick={() => handleOpenLogModal(veh)}
                  >
                    <History size={12} />
                    <span>📜 Lihat Riwayat / Log Driver Unit</span>
                  </button>
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-end gap-1 pt-2 border-top mt-auto">
                  {hasAccess('Vehicle', 'edit') && (
                    <button 
                      className="btn btn-light border btn-sm py-0.5 px-2 text-xs font-semibold text-primary d-flex align-items-center gap-1"
                      onClick={() => onOpenEditVehicle(veh)}
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>
                  )}
                  {hasAccess('Vehicle', 'delete') && (
                    <button 
                      className="btn btn-outline-danger btn-sm py-0.5 px-1.5 text-xs"
                      onClick={() => onDeleteVehicle(veh.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-12">
            <div className="p-4 bg-white rounded-3 text-center text-muted border">
              <Truck size={32} className="mb-2 opacity-50" />
              <p className="small mb-0">Belum ada data armada mobil yang cocok.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Riwayat / Log Penggunaan Driver per Mobil */}
      {selectedVehicleForLog && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              {/* Header */}
              <div className="modal-header bg-dark text-white py-3 px-4">
                <div className="d-flex align-items-center gap-2.5">
                  <div className="rounded-circle bg-primary bg-opacity-25 text-white p-2">
                    <History size={20} />
                  </div>
                  <div>
                    <h6 className="modal-title fw-bold mb-0 text-white" style={{ fontSize: '0.95rem' }}>
                      Riwayat Penggunaan &amp; Log Driver Unit: {selectedVehicleForLog.plateNumber || selectedVehicleForLog.plate_number}
                    </h6>
                    <small className="text-secondary" style={{ fontSize: '0.72rem' }}>
                      {selectedVehicleForLog.brandModel || selectedVehicleForLog.model} &bull; Vendor: {selectedVehicleForLog.vendor || 'Kepemilikan BSM'}
                    </small>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedVehicleForLog(null)}></button>
              </div>

              <div className="modal-body p-3 p-md-4 small">
                {/* Current Driver Summary Card */}
                <div className="p-3 bg-light rounded-3 border mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                  <div>
                    <span className="text-muted d-block text-xs" style={{ fontSize: '0.7rem' }}>Pengemudi Utama Saat Ini:</span>
                    <h6 className="fw-bold text-dark mb-0 font-sans" style={{ fontSize: '0.95rem' }}>
                      {selectedVehicleForLog.driverName || selectedVehicleForLog.driver_name || 'Belum Ditugaskan'}
                    </h6>
                    {selectedVehicleForLog.driverWhatsapp && selectedVehicleForLog.driverWhatsapp !== '-' && (
                      <small className="text-muted font-mono" style={{ fontSize: '0.7rem' }}>
                        WA: {selectedVehicleForLog.driverWhatsapp || selectedVehicleForLog.driver_whatsapp}
                      </small>
                    )}
                  </div>

                  {hasAccess('Vehicle', 'create') && (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-primary py-1 px-3 fw-semibold d-flex align-items-center gap-1.5 shadow-2xs"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setShowAddLogForm(!showAddLogForm)}
                    >
                      <PlusCircle size={13} />
                      <span>{showAddLogForm ? 'Tutup Form Ganti Driver' : '+ Ganti / Tugaskan Driver Baru'}</span>
                    </button>
                  )}
                </div>

                {/* Form Add / Switch Driver */}
                {showAddLogForm && (
                  <form onSubmit={handleAddLog} className="p-3 bg-primary bg-opacity-10 border border-primary rounded-3 mb-3">
                    <h6 className="fw-bold text-primary mb-2" style={{ fontSize: '0.8125rem' }}>
                      Catat Penugasan / Ganti Driver Baru
                    </h6>
                    <div className="row g-2">
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-bold text-dark mb-1">Nama Driver Baru <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm form-control-clean" 
                          placeholder="Nama lengkap driver"
                          value={newLogData.driver_name}
                          onChange={(e) => setNewLogData({ ...newLogData, driver_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-bold text-dark mb-1">Nomor WhatsApp Driver</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm form-control-clean font-mono" 
                          placeholder="0812xxxxxxxx"
                          value={newLogData.driver_whatsapp}
                          onChange={(e) => setNewLogData({ ...newLogData, driver_whatsapp: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-bold text-dark mb-1">Tanggal Penugasan</label>
                        <input 
                          type="date" 
                          className="form-control form-control-sm form-control-clean" 
                          value={newLogData.start_date}
                          onChange={(e) => setNewLogData({ ...newLogData, start_date: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-8">
                        <label className="form-label small fw-bold text-dark mb-1">Catatan / Rute Operasional</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm form-control-clean" 
                          placeholder="Contoh: Rute Jakarta - Cikarang / Project Site A"
                          value={newLogData.notes}
                          onChange={(e) => setNewLogData({ ...newLogData, notes: e.target.value })}
                        />
                      </div>
                      <div className="col-12 col-md-4 d-flex align-items-end">
                        <button type="submit" className="btn btn-sm btn-primary w-100 py-1 fw-semibold d-flex align-items-center justify-content-center gap-1">
                          <Check size={13} />
                          <span>Simpan Penugasan</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Timeline & History Logs List */}
                <h6 className="fw-bold text-dark mb-2 pb-1 border-bottom" style={{ fontSize: '0.8125rem' }}>
                  Riwayat Driver &amp; Pemakaian Unit Sebelumnya
                </h6>

                {loadingLogs ? (
                  <div className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    <span>Memuat riwayat log penggunaan...</span>
                  </div>
                ) : vehicleLogs.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-clean align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Tanggal / Periode</th>
                          <th>Nama Driver</th>
                          <th>Kontak WhatsApp</th>
                          <th>Aktivitas</th>
                          <th>Catatan / Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicleLogs.map((log, idx) => (
                          <tr key={log.id || idx}>
                            <td>
                              <div className="d-flex align-items-center gap-1.5">
                                <Calendar size={12} className="text-muted" />
                                <span className="font-mono text-dark" style={{ fontSize: '0.72rem' }}>
                                  {log.start_date ? log.start_date.split(' ')[0] : '-'}
                                  {log.end_date ? ` s/d ${log.end_date.split(' ')[0]}` : ' (Aktif)'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <strong className="text-dark d-block" style={{ fontSize: '0.78rem' }}>{log.driver_name}</strong>
                            </td>
                            <td>
                              <span className="font-mono text-muted" style={{ fontSize: '0.72rem' }}>{log.driver_whatsapp || '-'}</span>
                            </td>
                            <td>
                              <span className={`badge-soft ${
                                log.action && log.action.includes('Pengembalian') ? 'badge-soft-slate' :
                                log.action && log.action.includes('Ganti') ? 'badge-soft-warning' :
                                'badge-soft-primary'
                              }`} style={{ fontSize: '0.65rem' }}>
                                {log.action || 'Penugasan Unit'}
                              </span>
                            </td>
                            <td>
                              <span className="text-muted" style={{ fontSize: '0.72rem' }}>{log.notes || '-'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-light rounded text-center text-muted">
                    <History size={24} className="mb-1 opacity-50" />
                    <p className="small mb-0">Belum ada catatan riwayat pengemudi untuk mobil ini.</p>
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light py-2 px-3 justify-content-between">
                <span className="text-muted small font-mono" style={{ fontSize: '0.7rem' }}>
                  Total {vehicleLogs.length} Riwayat Tercatat
                </span>
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setSelectedVehicleForLog(null)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal: Buka Foto Barcode BBM */}
      {previewBarcode && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden bg-dark text-white">
              <div className="modal-header border-secondary py-2 px-3">
                <h6 className="modal-title fw-bold mb-0 text-white" style={{ fontSize: '0.875rem' }}>
                  Foto Barcode BBM Unit: {previewBarcode.title}
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewBarcode(null)}></button>
              </div>
              <div className="modal-body p-4 text-center bg-white d-flex align-items-center justify-content-center" style={{ minHeight: '280px' }}>
                <img 
                  src={previewBarcode.img} 
                  alt="Barcode BBM Full" 
                  className="img-fluid rounded border shadow-2xs" 
                  style={{ maxHeight: '60vh', objectFit: 'contain' }} 
                />
              </div>
              <div className="modal-footer border-secondary py-1.5 px-3 justify-content-between">
                <span className="text-secondary small font-mono">{previewBarcode.title}</span>
                <div className="d-flex gap-2">
                  <a 
                    href={previewBarcode.img} 
                    download={`barcode_${previewBarcode.title}.png`}
                    className="btn btn-sm btn-primary py-1 px-3 d-flex align-items-center gap-1 font-semibold"
                  >
                    <Download size={13} />
                    <span>Download Foto</span>
                  </a>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setPreviewBarcode(null)}>
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
