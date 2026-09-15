import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, UploadCloud, ArrowLeft, ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';

export default function FinanceInput({ onSave, onCancel, vehicles, employees }) {
  const { currentUser, showToast } = useAuth();
  
  const [transactionType, setTransactionType] = useState('out'); // 'out' (Pengeluaran) or 'in' (Deposit)

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Bahan Bakar Minyak (BBM - Khusus Validasi Driver)',
    description: '',
    amount: '',
    plate_number: '',
    driver_name: '',
    receipt_file: '',
    receipt_preview: null,
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({
          ...prev,
          receipt_file: file.name,
          receipt_preview: ev.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      showToast('Harap isi nominal transaksi yang valid.', 'error');
      return;
    }

    const isDeposit = transactionType === 'in';
    const recipient = isDeposit 
      ? (form.driver_name || 'Direksi / Kantor Pusat') 
      : form.driver_name;

    if (!isDeposit && !recipient) {
      showToast('Harap isi nama PIC / Driver yang bertanggung jawab.', 'error');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...form,
        type: transactionType,
        category: isDeposit ? 'Deposit' : form.category,
        amount: parseFloat(form.amount) || 0,
        recipient_name: recipient,
        pic_name: recipient,
        status: (isDeposit || !form.category.includes('BBM')) ? 'Tervalidasi' : 'Belum Divalidasi'
      });
      showToast(isDeposit ? 'Deposit kas operasional berhasil ditambahkan!' : 'Transaksi pengeluaran kas berhasil dicatat!', 'success');
      onCancel();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan transaksi.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isDeposit = transactionType === 'in';

  return (
    <div className="container-fluid py-3 px-3 px-md-4" style={{ maxWidth: '850px' }}>
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-light border p-1" onClick={onCancel}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h5 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
              {isDeposit ? 'Form Input Deposit Kas (Pemasukan)' : 'Form Input Pengeluaran Kas (Finance)'}
            </h5>
            <small className="text-muted" style={{ fontSize: '0.72rem' }}>
              {isDeposit ? 'Pencatatan saldo dana masuk / top-up kas operasional' : 'Pencatatan nota kas operasional sesuai PRD 3.2'}
            </small>
          </div>
        </div>
      </div>

      {/* Tipe Transaksi Toggle */}
      <div className="card border-0 shadow-xs rounded-3 bg-white p-2 mb-3">
        <div className="row g-2">
          <div className="col-6">
            <button
              type="button"
              className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-2 fw-bold text-sm ${!isDeposit ? 'btn-danger text-white shadow-xs' : 'btn-light text-muted border-0'}`}
              onClick={() => {
                setTransactionType('out');
                setForm(prev => ({
                  ...prev,
                  category: 'Bahan Bakar Minyak (BBM - Khusus Validasi Driver)',
                  description: '',
                  driver_name: ''
                }));
              }}
            >
              <ArrowUpRight size={18} />
              <span>Kas Keluar (Pengeluaran)</span>
            </button>
          </div>
          <div className="col-6">
            <button
              type="button"
              className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-2 fw-bold text-sm ${isDeposit ? 'btn-success text-white shadow-xs' : 'btn-light text-muted border-0'}`}
              onClick={() => {
                setTransactionType('in');
                setForm(prev => ({
                  ...prev,
                  category: 'Deposit',
                  description: 'Top-up dana kas operasional',
                  driver_name: 'Direksi / Kantor Pusat',
                  plate_number: ''
                }));
              }}
            >
              <ArrowDownRight size={18} />
              <span>Kas Masuk (Deposit / Top-up)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="card-clean p-4 bg-white">
        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            {/* Tanggal */}
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Tanggal Transaksi <span className="text-danger">*</span></label>
              <input 
                type="date" 
                className="form-control form-control-sm form-control-clean"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            {/* Kategori */}
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Kategori Transaksi <span className="text-danger">*</span></label>
              {isDeposit ? (
                <input 
                  type="text" 
                  className="form-control form-control-sm form-control-clean fw-bold text-success"
                  value="Deposit / Top-Up Kas"
                  readOnly 
                />
              ) : (
                <select 
                  className="form-select form-select-sm form-control-clean fw-semibold"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Bahan Bakar Minyak (BBM - Khusus Validasi Driver)">Bahan Bakar Minyak (BBM - Khusus Validasi Driver)</option>
                  <option value="Tol">Biaya Tol (E-Toll / Trans Jawa)</option>
                  <option value="Lalamove / Ekspedisi">Lalamove / Ekspedisi Barang</option>
                  <option value="Tools / Peralatan">Tools / Perkakas Kerja</option>
                  <option value="Makan & Inap">Makan &amp; Inap Lapangan</option>
                  <option value="Lainnya">Operasional Lainnya</option>
                </select>
              )}
            </div>

            {/* Nominal Transaksi dengan Pemisah Ribuan Titik Otomatis */}
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">
                Nominal Transaksi (IDR) <span className="text-danger">*</span>
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text font-mono fw-bold bg-light text-muted" style={{ fontSize: '0.78rem' }}>
                  Rp
                </span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  className={`form-control form-control-clean font-mono fw-bold ${isDeposit ? 'text-success' : 'text-danger'}`}
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
                  <span className="text-primary fw-bold">Rp {new Intl.NumberFormat('id-ID').format(form.amount)}</span>
                  <span className="badge bg-light text-secondary border">{String(form.amount).length} digit angka</span>
                </div>
              ) : (
                <div className="form-text text-muted" style={{ fontSize: '0.7rem' }}>
                  Format titik otomatis mencegah salah ketik jumlah 0.
                </div>
              )}
            </div>

            {/* Info Banner Deposit */}
            {isDeposit && (
              <div className="col-12">
                <div className="alert alert-success py-2 px-3 mb-0 d-flex align-items-center gap-2 border-0 rounded-2" style={{ fontSize: '0.78rem', backgroundColor: '#dcfce7', color: '#166534' }}>
                  <span className="fs-6">💰</span>
                  <div>
                    <strong>Pemasukan Dana / Deposit Kas:</strong> Transaksi ini akan <strong>menambah saldo kas aktif</strong> Finance dan tercatat sebagai uang masuk (kredit kas).
                  </div>
                </div>
              </div>
            )}

            {/* Keterangan */}
            <div className="col-12">
              <label className="form-label small fw-bold text-dark mb-1">
                {isDeposit ? 'Keterangan Sumber / Tujuan Dana Top-Up' : 'Keterangan / Merchant / Tujuan Pengeluaran'} <span className="text-danger">*</span>
              </label>
              <input 
                type="text" 
                className="form-control form-control-sm form-control-clean"
                placeholder={isDeposit ? 'Contoh: Transfer dana operasional dari Direksi ke rekening kas Finance...' : 'Contoh: Pengisian BBM Pertalite Avanza di SPBU Pasteur...'}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            {/* PIC / Penyetor */}
            <div className={`col-12 ${isDeposit ? 'col-md-12' : 'col-md-6'}`}>
              <label className="form-label small fw-bold text-dark mb-1">
                {isDeposit ? 'Penyetor / Sumber Dana' : 'PIC / Driver yang Bertanggung Jawab'} <span className="text-danger">*</span>
              </label>
              <input 
                type="text" 
                list="registered-drivers-list"
                className="form-control form-control-sm form-control-clean"
                placeholder={isDeposit ? 'Contoh: Direksi / Owner / Kantor Pusat' : 'Nama karyawan / driver penerima dana'}
                value={form.driver_name}
                onChange={(e) => {
                  const inputName = e.target.value;
                  const matchedVeh = (vehicles || []).find(v => (v.driverName || v.driver_name)?.toLowerCase() === inputName.toLowerCase());
                  setForm(prev => ({
                    ...prev,
                    driver_name: inputName,
                    plate_number: matchedVeh ? (matchedVeh.plateNumber || matchedVeh.plate_number) : prev.plate_number
                  }));
                }}
                required
              />
              <datalist id="registered-drivers-list">
                {isDeposit ? (
                  <>
                    <option value="Direksi / Owner" />
                    <option value="Kantor Pusat" />
                    <option value="Kas Utama" />
                  </>
                ) : (
                  <>
                    {(vehicles || []).filter(v => v.driverName || v.driver_name).map(v => (
                      <option key={v.id} value={v.driverName || v.driver_name}>
                        {v.driverName || v.driver_name} ({v.plateNumber || v.plate_number})
                      </option>
                    ))}
                    {(employees || []).map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name} ({emp.nip || emp.role})</option>
                    ))}
                  </>
                )}
              </datalist>
            </div>

            {/* Plat Nomor Kendaraan (Hanya untuk pengeluaran) */}
            {!isDeposit && (
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-dark mb-1">
                  Plat Nomor Kendaraan {form.category.includes('BBM') && <span className="text-danger">*</span>}
                </label>
                <select 
                  className="form-select form-select-sm form-control-clean font-mono fw-semibold"
                  value={form.plate_number}
                  onChange={(e) => {
                    const plateNum = e.target.value;
                    const matchedVeh = (vehicles || []).find(v => (v.plateNumber || v.plate_number) === plateNum);
                    setForm(prev => ({
                      ...prev,
                      plate_number: plateNum,
                      driver_name: matchedVeh?.driverName || matchedVeh?.driver_name || prev.driver_name
                    }));
                  }}
                  required={form.category.includes('BBM')}
                >
                  <option value="">-- Pilih Transaksi Kendaraan --</option>
                  {(vehicles || []).map(v => (
                    <option key={v.id} value={v.plateNumber || v.plate_number}>
                      {v.plateNumber || v.plate_number} {v.driverName ? `(Driver: ${v.driverName})` : ''} - {v.model || v.brandModel || 'Unit Armada'}
                    </option>
                  ))}
                </select>
                {form.plate_number && (
                  <div className="form-text text-muted" style={{ fontSize: '0.72rem' }}>
                    ✓ Driver otomatis terhubung dengan armada yang dipilih.
                  </div>
                )}
              </div>
            )}

            {/* Upload Bukti */}
            <div className="col-12">
              <label className="form-label small fw-bold text-dark mb-1">
                {isDeposit ? 'Bukti Transfer Bank / Rekening Koran (Opsional)' : 'Upload Bukti Nota / Kwitansi Fisik (Opsional)'}
              </label>
              <div className="p-3 bg-light rounded-2 border text-center">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="d-none" 
                  id="receipt-file-input"
                  onChange={handleFileUpload}
                />
                <label htmlFor="receipt-file-input" className="btn btn-outline-primary btn-sm py-1 px-3 text-xs mb-1">
                  <UploadCloud size={13} className="me-1" />
                  {form.receipt_file ? 'Ganti Berkas Bukti' : 'Pilih Foto / Berkas Bukti'}
                </label>
                {form.receipt_file && (
                  <small className="text-muted d-block text-truncate mt-1">{form.receipt_file}</small>
                )}
                {form.receipt_preview && (
                  <img src={form.receipt_preview} alt="Bukti" className="img-thumbnail mt-2" style={{ maxHeight: '80px' }} />
                )}
              </div>
            </div>

            {/* Catatan */}
            <div className="col-12">
              <label className="form-label small fw-bold text-dark mb-1">Catatan Tambahan Finance</label>
              <textarea 
                className="form-control form-control-sm form-control-clean"
                rows="2"
                placeholder="Catatan rincian anggaran..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button type="button" className="btn btn-sm btn-light border px-3 font-semibold" onClick={onCancel}>
              Batal
            </button>
            <button 
              type="submit" 
              className={`btn btn-sm px-4 fw-semibold shadow-2xs ${isDeposit ? 'btn-success text-white' : 'btn-primary'}`} 
              disabled={saving}
            >
              <span>{saving ? 'Menyimpan...' : (isDeposit ? 'Simpan Deposit Kas (+)' : 'Simpan Transaksi Kas (-)')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
