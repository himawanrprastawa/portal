import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, Plus, Search, Calendar, Filter, FileText, CheckCircle2, 
  AlertCircle, Eye, Trash2, ArrowDownRight, ArrowUpRight, Wallet, 
  Fuel, TrendingUp, TrendingDown, DollarSign, AlertTriangle 
} from 'lucide-react';

export default function FinanceTransactions({ 
  expenses = [], 
  onOpenInput, 
  onOpenGoogleDocs, 
  onDeleteExpense 
}) {
  const { formatCurrency, showToast } = useAuth();
  
  const [filterType, setFilterType] = useState('All'); // 'All', 'in', 'out'
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedExpenseDetail, setSelectedExpenseDetail] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Helper check for deposit vs expense
  const isDepositItem = (exp) => {
    return exp.type === 'in' || 
      exp.category === 'Deposit' || 
      (exp.category || '').toLowerCase().includes('deposit');
  };

  const isPendingBbmItem = (exp) => {
    const isBbm = (exp.category === 'BBM' || (exp.category || '').toLowerCase().includes('bbm') || (exp.description || '').toLowerCase().includes('bbm'));
    return isBbm && exp.status === 'Belum Divalidasi';
  };

  // --- Real-time Financial Ledger Calculations ---
  const totalDeposit = expenses
    .filter(isDepositItem)
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const totalExpense = expenses
    .filter(e => !isDepositItem(e))
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const currentCashBalance = totalDeposit - totalExpense;

  const pendingBbmExpenses = expenses.filter(isPendingBbmItem);
  const pendingBbmAmount = pendingBbmExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const pendingBbmCount = pendingBbmExpenses.length;

  // Quick date shortcuts
  const handleShortcutDate = (type) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (type === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (type === 'month') {
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      setStartDate(`${y}-${m}-01`);
      setEndDate(todayStr);
    } else if (type === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Filtered List
  const filtered = (expenses || []).filter(exp => {
    const isDep = isDepositItem(exp);
    if (filterType === 'in' && !isDep) return false;
    if (filterType === 'out' && isDep) return false;
    if (filterCategory !== 'All' && exp.category !== filterCategory) return false;
    if (filterStatus !== 'All' && exp.status !== filterStatus) return false;
    if (startDate && exp.date && exp.date < startDate) return false;
    if (endDate && exp.date && exp.date > endDate) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDesc = exp.description && exp.description.toLowerCase().includes(q);
      const matchCat = exp.category && exp.category.toLowerCase().includes(q);
      const matchDriver = (exp.driver_name || exp.recipient_name || exp.pic_name || '').toLowerCase().includes(q);
      const matchPlate = (exp.plate_number || '').toLowerCase().includes(q);
      const matchCode = (exp.code || '').toLowerCase().includes(q);
      return matchDesc || matchCat || matchDriver || matchPlate || matchCode;
    }
    return true;
  });

  const handleDelete = async (exp) => {
    const confirmMsg = `Yakin ingin menghapus transaksi "${exp.code || ''} - ${exp.description || ''}" senilai ${formatCurrency(exp.amount)}?\n\nSaldo kas akan otomatis dikalkulasi ulang.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(exp.id);
    try {
      if (onDeleteExpense) {
        await onDeleteExpense(exp.id);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus transaksi.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark mb-0.5" style={{ letterSpacing: '-0.02em' }}>
            Manajemen Arus Kas Operasional &amp; Transaksi (Finance)
          </h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
            Monitoring saldo kas masuk (Deposit), kas keluar operasional, serta audit nota BBM lapangan.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm fw-semibold d-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem' }} onClick={onOpenGoogleDocs}>
            <span>📑</span>
            <span>Sinkronisasi Google Docs</span>
          </button>
          <button className="btn btn-primary btn-sm fw-semibold d-flex align-items-center gap-1.5 shadow-2xs" style={{ fontSize: '0.75rem' }} onClick={onOpenInput}>
            <Plus size={14} />
            <span>+ Input Kas (Masuk / Keluar)</span>
          </button>
        </div>
      </div>

      {/* 4 KPI SUMMARY CARDS: Real-time Ledger */}
      <div className="row g-3 mb-3">
        {/* 1. Total Deposit Masuk */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3 h-100 border-start border-4 border-success">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted fw-bold text-2xs text-uppercase tracking-wider">Total Kas Masuk (Deposit)</span>
              <span className="p-1.5 rounded-2 bg-success bg-opacity-10 text-success">
                <TrendingUp size={16} />
              </span>
            </div>
            <div className="h5 fw-bold font-mono text-success mb-1">
              {formatCurrency(totalDeposit)}
            </div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
              Dana deposit &amp; top-up kas operasional
            </div>
          </div>
        </div>

        {/* 2. Total Pengeluaran Keluar */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3 h-100 border-start border-4 border-danger">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted fw-bold text-2xs text-uppercase tracking-wider">Total Kas Keluar</span>
              <span className="p-1.5 rounded-2 bg-danger bg-opacity-10 text-danger">
                <TrendingDown size={16} />
              </span>
            </div>
            <div className="h5 fw-bold font-mono text-danger mb-1">
              {formatCurrency(totalExpense)}
            </div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
              Biaya BBM, Tol, Tools, Makan &amp; Ops
            </div>
          </div>
        </div>

        {/* 3. Saldo Kas Aktif */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className={`card border-0 shadow-xs rounded-3 bg-white p-3 h-100 border-start border-4 ${currentCashBalance >= 0 ? 'border-primary' : 'border-danger'}`}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted fw-bold text-2xs text-uppercase tracking-wider">Saldo Kas Operasional</span>
              <span className={`p-1.5 rounded-2 ${currentCashBalance >= 0 ? 'bg-primary bg-opacity-10 text-primary' : 'bg-danger bg-opacity-10 text-danger'}`}>
                <Wallet size={16} />
              </span>
            </div>
            <div className={`h5 fw-bold font-mono mb-1 ${currentCashBalance >= 0 ? 'text-primary' : 'text-danger'}`}>
              {formatCurrency(currentCashBalance)}
            </div>
            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
              {currentCashBalance >= 0 ? 'Sisa kas aktif siap dialokasikan' : 'Peringatan: Kas mengalami defisit'}
            </div>
          </div>
        </div>

        {/* 4. Selisih Uang BBM Belum Divalidasi */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3 h-100 border-start border-4 border-warning">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted fw-bold text-2xs text-uppercase tracking-wider">BBM Belum Divalidasi</span>
              <span className="p-1.5 rounded-2 bg-warning bg-opacity-10 text-warning-emphasis">
                <Fuel size={16} />
              </span>
            </div>
            <div className="h5 fw-bold font-mono text-warning-emphasis mb-1">
              {formatCurrency(pendingBbmAmount)}
            </div>
            <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
              <span>{pendingBbmCount} transaksi menggantung</span>
              {pendingBbmCount > 0 && (
                <span className="badge bg-warning bg-opacity-20 text-dark px-1 py-0.5 rounded text-2xs">Perlu 3 Foto</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-clean mb-3 p-3 bg-white">
        <div className="row g-2.5 align-items-center">
          {/* Quick Date Shortcuts */}
          <div className="col-12 d-flex flex-wrap align-items-center gap-1.5 pb-2 border-bottom">
            <span className="text-muted fw-bold" style={{ fontSize: '0.72rem' }}>Pintasan Tanggal:</span>
            <button className="btn btn-sm btn-light border py-0.5 px-2 text-xs font-semibold" onClick={() => handleShortcutDate('today')}>Hari Ini</button>
            <button className="btn btn-sm btn-light border py-0.5 px-2 text-xs font-semibold" onClick={() => handleShortcutDate('7days')}>7 Hari Terakhir</button>
            <button className="btn btn-sm btn-light border py-0.5 px-2 text-xs font-semibold" onClick={() => handleShortcutDate('month')}>Bulan Ini</button>
            <button className="btn btn-sm btn-light border py-0.5 px-2 text-xs font-semibold" onClick={() => handleShortcutDate('all')}>Semua Tanggal</button>
          </div>

          {/* Date Range Inputs */}
          <div className="col-12 col-md-3 d-flex align-items-center gap-1.5">
            <input 
              type="date" 
              className="form-control form-control-sm form-control-clean"
              style={{ fontSize: '0.75rem' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Dari Tanggal"
            />
            <span className="text-muted">-</span>
            <input 
              type="date" 
              className="form-control form-control-sm form-control-clean"
              style={{ fontSize: '0.75rem' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Sampai Tanggal"
            />
          </div>

          {/* Filter Tipe Arus Kas */}
          <div className="col-6 col-md-2">
            <select 
              className="form-select form-select-sm form-control-clean fw-semibold"
              style={{ fontSize: '0.75rem' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">Semua Arus Kas</option>
              <option value="in">📥 Kas Masuk (Deposit)</option>
              <option value="out">📤 Kas Keluar (Biaya)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="col-6 col-md-2">
            <select 
              className="form-select form-select-sm form-control-clean"
              style={{ fontSize: '0.75rem' }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">Semua Kategori</option>
              <option value="Deposit">Deposit / Top-up</option>
              <option value="BBM">BBM (Bahan Bakar)</option>
              <option value="Tol">Biaya Tol</option>
              <option value="Lalamove">Lalamove / Ekspedisi</option>
              <option value="Tools">Tools / Perkakas</option>
              <option value="Makan Inap">Makan &amp; Inap</option>
              <option value="Lainnya">Operasional Lainnya</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select 
              className="form-select form-select-sm form-control-clean"
              style={{ fontSize: '0.75rem' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">Semua Status</option>
              <option value="Tervalidasi">Tervalidasi (Sah)</option>
              <option value="Sudah Divalidasi">Sudah Divalidasi</option>
              <option value="Belum Divalidasi">Belum Divalidasi</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="col-6 col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted border-end-0">
                <Search size={13} />
              </span>
              <input 
                type="text" 
                className="form-control form-control-clean border-start-0 ps-0"
                style={{ fontSize: '0.75rem' }}
                placeholder="Cari deskripsi, PIC, plat, kode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Summary Footer in Filter Card */}
        <div className="d-flex justify-content-between align-items-center pt-2 mt-2 border-top" style={{ fontSize: '0.75rem' }}>
          <span className="text-muted">{filtered.length} Transaksi Ditampilkan</span>
          <div className="d-flex gap-3">
            <span>
              <span className="text-muted me-1">Total Terpilih:</span>
              <strong className="font-mono text-dark" style={{ fontSize: '0.85rem' }}>
                {formatCurrency(filtered.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0))}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card-clean overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Tanggal &amp; Kode</th>
                <th>Tipe</th>
                <th>Kategori</th>
                <th>Keterangan / Transaksi</th>
                <th>PIC / Driver</th>
                <th>Mobil (Plat)</th>
                <th className="text-end">Nominal (IDR)</th>
                <th className="text-center">Status</th>
                <th className="text-center" style={{ minWidth: '110px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(exp => {
                const isDep = isDepositItem(exp);
                // Extract plate from direct plate_number or regex from description
                const plateText = exp.plate_number || 
                  (exp.description?.match(/\[([A-Za-z0-9\s]+)\]/)?.[1]) || 
                  '-';
                
                // Get accurate PIC / Driver name
                const picName = exp.pic_name || exp.recipient_name || exp.driver_name || '-';

                return (
                  <tr key={exp.id || Math.random()}>
                    <td>
                      <div className="font-mono fw-semibold text-dark" style={{ fontSize: '0.75rem' }}>
                        {exp.date || '-'}
                      </div>
                      <small className="text-muted font-mono" style={{ fontSize: '0.68rem' }}>
                        {exp.code || `ID-#${exp.id}`}
                      </small>
                    </td>

                    {/* Tipe Badge: In vs Out */}
                    <td>
                      {isDep ? (
                        <span className="badge bg-success bg-opacity-10 text-success fw-bold d-inline-flex align-items-center gap-1 px-2 py-1 rounded" style={{ fontSize: '0.7rem' }}>
                          <ArrowDownRight size={12} />
                          <span>Masuk</span>
                        </span>
                      ) : (
                        <span className="badge bg-danger bg-opacity-10 text-danger fw-bold d-inline-flex align-items-center gap-1 px-2 py-1 rounded" style={{ fontSize: '0.7rem' }}>
                          <ArrowUpRight size={12} />
                          <span>Keluar</span>
                        </span>
                      )}
                    </td>

                    {/* Kategori */}
                    <td>
                      <span className={`badge-soft ${
                        isDep ? 'badge-soft-success' :
                        (exp.category || '').includes('BBM') ? 'badge-soft-warning' :
                        (exp.category || '').includes('Tol') ? 'badge-soft-primary' :
                        (exp.category || '').includes('Lalamove') ? 'badge-soft-purple' :
                        (exp.category || '').includes('Tools') ? 'badge-soft-slate' :
                        'badge-soft-slate'
                      }`}>
                        {exp.category || (isDep ? 'Deposit' : 'Operasional')}
                      </span>
                    </td>

                    {/* Keterangan */}
                    <td>
                      <span className="fw-semibold text-dark d-block" style={{ fontSize: '0.78rem' }}>
                        {exp.description || exp.merchant || '-'}
                      </span>
                      {exp.validation_notes && (
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                          ✓ Validasi: {exp.validation_notes}
                        </small>
                      )}
                    </td>

                    {/* PIC / Driver */}
                    <td>
                      <span className="text-dark fw-medium" style={{ fontSize: '0.75rem' }}>
                        {picName}
                      </span>
                    </td>

                    {/* Mobil (Plat) */}
                    <td>
                      {plateText !== '-' ? (
                        <span className="badge-soft badge-soft-slate font-mono fw-bold" style={{ fontSize: '0.7rem' }}>
                          {plateText}
                        </span>
                      ) : (
                        <span className="text-muted text-xs">-</span>
                      )}
                    </td>

                    {/* Nominal */}
                    <td className="text-end font-mono fw-bold" style={{ fontSize: '0.82rem' }}>
                      <span className={isDep ? 'text-success' : 'text-danger'}>
                        {isDep ? '+ ' : '- '}
                        {formatCurrency(exp.amount)}
                      </span>
                    </td>

                    {/* Status Validasi */}
                    <td className="text-center">
                      <span className={`badge-soft ${
                        exp.status === 'Tervalidasi' ? 'badge-soft-success' :
                        exp.status === 'Sudah Divalidasi' ? 'badge-soft-primary' :
                        'badge-soft-warning'
                      }`}>
                        {exp.status || 'Tervalidasi'}
                      </span>
                    </td>

                    {/* Aksi: Detail & Hapus */}
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1.5">
                        <button 
                          type="button"
                          className="btn btn-sm btn-light border p-1 text-secondary"
                          title="Lihat Detail Transaksi"
                          onClick={() => setSelectedExpenseDetail(exp)}
                        >
                          <Eye size={13} />
                        </button>
                        <button 
                          type="button"
                          className="btn btn-sm btn-outline-danger p-1"
                          title="Hapus Transaksi"
                          disabled={deletingId === exp.id}
                          onClick={() => handleDelete(exp)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted small">
                    Tidak ada data transaksi kas yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Transaksi */}
      {selectedExpenseDetail && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom py-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <div className={`p-2 rounded-3 ${isDepositItem(selectedExpenseDetail) ? 'bg-success bg-opacity-10 text-success' : 'bg-primary bg-opacity-10 text-primary'}`}>
                    {isDepositItem(selectedExpenseDetail) ? <ArrowDownRight size={20} /> : <CreditCard size={20} />}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Rincian Transaksi Kas</h6>
                    <small className="text-muted font-mono" style={{ fontSize: '0.72rem' }}>
                      {selectedExpenseDetail.code || `ID: ${selectedExpenseDetail.id}`}
                    </small>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedExpenseDetail(null)} />
              </div>

              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Tanggal Transaksi</small>
                    <span className="fw-bold font-mono text-dark">{selectedExpenseDetail.date || '-'}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Tipe &amp; Kategori</small>
                    <span className="fw-bold text-dark">
                      {isDepositItem(selectedExpenseDetail) ? 'Kas Masuk (Deposit)' : selectedExpenseDetail.category}
                    </span>
                  </div>

                  <div className="col-12">
                    <small className="text-muted d-block">Nominal Transaksi</small>
                    <span className={`h4 fw-bold font-mono ${isDepositItem(selectedExpenseDetail) ? 'text-success' : 'text-danger'}`}>
                      {isDepositItem(selectedExpenseDetail) ? '+ ' : '- '}
                      {formatCurrency(selectedExpenseDetail.amount)}
                    </span>
                  </div>

                  <div className="col-12">
                    <small className="text-muted d-block">Keterangan / Deskripsi</small>
                    <div className="p-2 bg-light rounded border text-dark text-sm">
                      {selectedExpenseDetail.description || '-'}
                    </div>
                  </div>

                  <div className="col-6">
                    <small className="text-muted d-block">PIC / Penyetor</small>
                    <span className="fw-semibold text-dark">
                      {selectedExpenseDetail.pic_name || selectedExpenseDetail.recipient_name || selectedExpenseDetail.driver_name || '-'}
                    </span>
                  </div>

                  <div className="col-6">
                    <small className="text-muted d-block">Plat Armada</small>
                    <span className="font-mono fw-bold text-dark">
                      {selectedExpenseDetail.plate_number || (selectedExpenseDetail.description?.match(/\[([A-Za-z0-9\s]+)\]/)?.[1]) || '-'}
                    </span>
                  </div>

                  <div className="col-12">
                    <small className="text-muted d-block">Status Validasi</small>
                    <span className={`badge-soft ${
                      selectedExpenseDetail.status === 'Tervalidasi' ? 'badge-soft-success' :
                      selectedExpenseDetail.status === 'Sudah Divalidasi' ? 'badge-soft-primary' :
                      'badge-soft-warning'
                    }`}>
                      {selectedExpenseDetail.status}
                    </span>
                    {selectedExpenseDetail.validated_by && (
                      <small className="text-muted ms-2">
                        (Divalidasi oleh: {selectedExpenseDetail.validated_by})
                      </small>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top py-2.5 px-4 d-flex justify-content-between">
                <button 
                  type="button" 
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                  onClick={() => {
                    const toDel = selectedExpenseDetail;
                    setSelectedExpenseDetail(null);
                    handleDelete(toDel);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Hapus Transaksi Ini</span>
                </button>
                <button type="button" className="btn btn-secondary btn-sm px-3" onClick={() => setSelectedExpenseDetail(null)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
