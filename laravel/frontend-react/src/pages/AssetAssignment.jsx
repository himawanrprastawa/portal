import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, Users, ArrowRight, CheckCircle2, Search, Link } from 'lucide-react';

export default function AssetAssignment({ vehicles = [], employees = [], onAssignAsset }) {
  const { showToast } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles && vehicles[0] ? (vehicles[0].id || vehicles[0].plateNumber || '') : '');
  const [selectedEmployee, setSelectedEmployee] = useState(employees && employees[0] ? (employees[0].id || employees[0].nip || employees[0].name || '') : '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedVehicle || !selectedEmployee) {
      showToast('Pilih kendaraan dan karyawan terlebih dahulu.', 'error');
      return;
    }

    setSaving(true);
    try {
      const veh = (vehicles || []).find(v => String(v.id) === String(selectedVehicle) || v.plateNumber === selectedVehicle || v.plate_number === selectedVehicle);
      const emp = (employees || []).find(e => String(e.id) === String(selectedEmployee) || e.nip === selectedEmployee || e.name === selectedEmployee);
      
      if (onAssignAsset) {
        await onAssignAsset({
          vehicleId: selectedVehicle,
          employeeId: selectedEmployee,
          plateNumber: veh?.plateNumber || veh?.plate_number,
          employeeName: emp?.name,
          notes
        });
      }
      showToast(`Unit ${veh?.plateNumber || veh?.plate_number || 'Mobil'} berhasil ditugaskan kepada ${emp?.name || 'Karyawan'}!`, 'success');
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4" style={{ maxWidth: '900px' }}>
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark mb-0.5" style={{ letterSpacing: '-0.02em' }}>Penugasan Aset Kendaraan (Relasional Tracking)</h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
            Integrasi relasi tanggung jawab unit armada operasional kepada driver / karyawan (PRD 3.5).
          </p>
        </div>
      </div>

      {/* Form Penugasan */}
      <div className="card-clean p-4 bg-white mb-4">
        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.8125rem' }}>Pilih Unit Kendaraan &amp; Karyawan Penanggung Jawab</h6>
        <form onSubmit={handleAssign}>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-5">
              <label className="form-label small fw-bold text-dark mb-1">Pilih Unit Kendaraan Operasional</label>
              <select 
                className="form-select form-select-sm form-control-clean font-mono"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                required
              >
                <option value="">-- Pilih Unit Kendaraan --</option>
                {(vehicles || []).map(v => (
                  <option key={v.id || v.plateNumber} value={v.id || v.plateNumber}>
                    {v.plateNumber || v.plate_number} - {v.brandModel || v.model || 'Mobil'} ({v.status || 'Tersedia'})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-2 d-none d-md-flex align-items-center justify-content-center pt-4 text-muted">
              <ArrowRight size={20} />
            </div>

            <div className="col-12 col-md-5">
              <label className="form-label small fw-bold text-dark mb-1">Pilih Karyawan / Driver</label>
              <select 
                className="form-select form-select-sm form-control-clean"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                required
              >
                <option value="">-- Pilih Karyawan / Driver --</option>
                {(employees || []).map(emp => (
                  <option key={emp.id || emp.nip || emp.name} value={emp.id || emp.nip || emp.name}>
                    {emp.nip || emp.nik ? `[${emp.nip || emp.nik}] ` : ''}{emp.name} ({emp.position || emp.department || 'Staff'})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label small fw-bold text-dark mb-1">Catatan Penugasan &amp; Kondisi Unit</label>
              <textarea 
                className="form-control form-control-sm form-control-clean"
                rows="2"
                placeholder="Contoh: Diserahkan dalam kondisi baik, toolkit lengkap..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end pt-2 border-top">
            <button type="submit" className="btn btn-sm btn-primary px-4 fw-semibold shadow-2xs" disabled={saving}>
              <Link size={13} className="me-1.5" />
              <span>{saving ? 'Menugaskan...' : 'Tugaskan Unit ke Karyawan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Relational Table of Assigned Vehicles */}
      <div className="card-clean overflow-hidden bg-white">
        <div className="p-3 border-bottom">
          <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.8125rem' }}>Daftar Unit &amp; Penanggung Jawab Aktif</h6>
        </div>
        <div className="table-responsive">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Plat Nomor</th>
                <th>Merek / Model</th>
                <th>Driver / PIC Bertugas</th>
                <th>WhatsApp Driver</th>
                <th className="text-center">Status Unit</th>
              </tr>
            </thead>
            <tbody>
              {(vehicles || []).map(v => (
                <tr key={v.id || v.plateNumber || v.plate_number}>
                  <td>
                    <strong className="font-mono text-dark" style={{ fontSize: '0.8rem' }}>{v.plateNumber || v.plate_number}</strong>
                  </td>
                  <td>{v.brandModel || v.model || '-'}</td>
                  <td>
                    <strong className="text-dark d-block" style={{ fontSize: '0.78rem' }}>{v.driverName || v.driver_name || 'Belum Ditugaskan'}</strong>
                  </td>
                  <td className="font-mono" style={{ fontSize: '0.75rem' }}>
                    {v.driverWhatsapp || v.driver_whatsapp || '-'}
                  </td>
                  <td className="text-center">
                    <span className={`badge-soft ${v.status === 'Tersedia' ? 'badge-soft-success' : 'badge-soft-warning'}`}>
                      {v.status || 'Tersedia'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

