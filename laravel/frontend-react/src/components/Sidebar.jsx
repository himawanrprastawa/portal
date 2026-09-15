import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  mobileOpen, 
  onCloseMobile, 
  inboxStats, 
  financeStats, 
  zoneStats,
  expensesCount,
  vehiclesCount,
  employeesCount
}) {
  const { hasAccess, currentUser } = useAuth();

  // Collapsible dropdown states per module
  const [openSections, setOpenSections] = useState({
    inbox: true,
    supervisor: false,
    external: true,
    finance: false,
    user: false,
    hrd: false,
    vehicle: false,
    master: false
  });

  // Auto-expand section when activeTab is in that module
  useEffect(() => {
    if (['manager-inbox', 'manager-comcase-all', 'manager-external-all'].includes(activeTab)) {
      setOpenSections(prev => ({ ...prev, inbox: true }));
    } else if (['comcase-form', 'comcase-list', 'comcase-summary'].includes(activeTab)) {
      setOpenSections(prev => ({ ...prev, supervisor: true }));
    } else if (['zone-requests', 'zone-review'].includes(activeTab)) {
      setOpenSections(prev => ({ ...prev, external: true }));
    } else if (['finance-pending', 'finance-transactions', 'finance-input', 'finance-google-docs'].includes(activeTab)) {
      setOpenSections(prev => ({ ...prev, finance: true }));
    } else if (['user-bbm-validation'].includes(activeTab)) {
      setOpenSections(prev => ({ ...prev, user: true }));
    } else if (['employee-list', 'employee-form'].includes(activeTab)) {
      setOpenSections(prev => ({ ...prev, hrd: true }));
    } else if (['vehicle-list', 'vehicle-form', 'asset-assignment'].includes(activeTab)) {
      setOpenSections(prev => ({ ...prev, vehicle: true }));
    } else if (['master-users', 'master-settings'].includes(activeTab)) {
      setOpenSections(prev => ({ ...prev, master: true }));
    }
  }, [activeTab]);

  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const isMaster = currentUser?.role === 'Master' || (currentUser?.role || '').toLowerCase().includes('master');
  const roleName = (currentUser?.role || '').toLowerCase();
  const isZoneManager = roleName.includes('zone');
  const isFinance = roleName.includes('finance');
  const isManager = !isZoneManager && (roleName === 'manager' || roleName.includes('manager ops'));
  const isGM = roleName.includes('general manager') || roleName === 'gm';
  const isDireksi = roleName.includes('direksi') || roleName.includes('owner');
  const isManagementTier = isManager || isGM || isDireksi;

  const userName = (currentUser?.username || '').toLowerCase().trim();
  const empName = (currentUser?.employee_name || '').toLowerCase().trim();
  const isFieldRole = roleName === 'user' || roleName === 'driver' || roleName.includes('lapangan') || userName === 'driver' || userName === 'lapangan' || empName.includes('driver') || empName.includes('lapangan');

  const navContent = (
    <div className="d-flex flex-column h-100 p-3">
      {/* Brand Header: Logo dari folder img tanpa teks BSM Portal */}
      <div className="d-flex align-items-center justify-content-between pb-3 mb-2 border-bottom border-secondary border-opacity-20">
        <div className="d-flex align-items-center justify-content-center w-100 py-1">
          <img 
            src="./img/logo.png" 
            alt="Logo" 
            className="img-fluid"
            style={{ maxHeight: '42px', maxWidth: '100%', objectFit: 'contain' }}
            onError={(e) => { e.target.src = './pic/logo.png'; }}
          />
        </div>
        {onCloseMobile && (
          <button className="btn btn-sm p-1 text-secondary d-md-none border-0" onClick={onCloseMobile}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Group Items: Teks bersih, mulus, tanpa ikon, tanpa panah dropdown, tanpa titik-titik */}
      <div className="flex-grow-1 overflow-y-auto pe-1">
        {/* 1. Dashboard Utama (Disembunyikan khusus untuk role Lapangan / Driver) */}
        {!isFieldRole && (
          <div className="mb-1">
            <div 
              className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <span>Dashboard Utama</span>
            </div>
          </div>
        )}

        {/* 2. Modul Kotak Masuk */}
        {(hasAccess('Inbox') || hasAccess('Inbox', 'view') || hasAccess('Inbox', 'comcase') || hasAccess('Inbox', 'external') || isMaster) && (
          <div className="mb-1">
            <button 
              type="button" 
              className={`sidebar-dropdown-header ${['manager-inbox', 'manager-comcase-all', 'manager-external-all'].includes(activeTab) ? 'text-primary' : ''}`}
              onClick={() => toggleSection('inbox')}
            >
              <span className="fw-semibold">Kotak Masuk</span>
              {inboxStats?.totalPending > 0 && (
                <span className="badge bg-primary text-white px-1.5 py-0.5 rounded text-2xs">
                  {inboxStats.totalPending}
                </span>
              )}
            </button>

            {openSections.inbox && (
              <div className="sidebar-dropdown-body">
                {(hasAccess('Inbox', 'view') || isMaster) && (
                  <div 
                    className={`sidebar-link py-1.5 ps-2 ${activeTab === 'manager-inbox' ? 'active' : ''}`}
                    onClick={() => handleNavClick('manager-inbox')}
                  >
                    <span>Kotak Masuk</span>
                    {inboxStats?.totalPending > 0 && (
                      <span className="badge bg-primary text-white px-1.5 py-0.5 rounded text-2xs ms-auto">
                        {inboxStats.totalPending}
                      </span>
                    )}
                  </div>
                )}
                {(hasAccess('Inbox', 'comcase') || isMaster) && (
                  <div 
                    className={`sidebar-link py-1.5 ps-2 ${activeTab === 'manager-comcase-all' ? 'active' : ''}`}
                    onClick={() => handleNavClick('manager-comcase-all')}
                  >
                    <span>Data Comcase</span>
                  </div>
                )}
                {(hasAccess('Inbox', 'external') || isMaster) && (
                  <div 
                    className={`sidebar-link py-1.5 ps-2 ${activeTab === 'manager-external-all' ? 'active' : ''}`}
                    onClick={() => handleNavClick('manager-external-all')}
                  >
                    <span>Data External</span>
                    {zoneStats?.pendingTotal > 0 && (
                      <span className="badge bg-primary text-white px-1.5 py-0.5 rounded text-2xs ms-auto">
                        {zoneStats.pendingTotal}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Permohonan Comcase */}
        {!isManagementTier && !isZoneManager && !isFinance && (hasAccess('Supervisor') || hasAccess('Team Leader') || (currentUser?.role || '').toLowerCase().includes('leader') || isMaster) && (
          <div className="mb-1">
            <button 
              type="button" 
              className={`sidebar-dropdown-header ${['comcase-form', 'comcase-list', 'comcase-summary'].includes(activeTab) ? 'text-primary' : ''}`}
              onClick={() => toggleSection('supervisor')}
            >
              <span className="fw-semibold">Permohonan Comcase</span>
            </button>

            {openSections.supervisor && (
              <div className="sidebar-dropdown-body">
                <div 
                  className={`sidebar-link py-1.5 ps-2 ${activeTab === 'comcase-list' ? 'active' : ''}`}
                  onClick={() => handleNavClick('comcase-list')}
                >
                  <span>Daftar Comcase</span>
                </div>
                <div 
                  className={`sidebar-link py-1.5 ps-2 ${activeTab === 'comcase-summary' ? 'active' : ''}`}
                  onClick={() => handleNavClick('comcase-summary')}
                >
                  <span>List Comcase</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Permohonan External */}
        {!isManagementTier && !isFinance && (isZoneManager || hasAccess('ZoneManager') || isMaster) && (
          <div className="mb-1">
            <div 
              className={`sidebar-link ${activeTab === 'zone-requests' ? 'active' : ''}`}
              onClick={() => handleNavClick('zone-requests')}
            >
              <span>Permohonan External</span>
              {zoneStats?.pendingTotal > 0 && (
                <span className="badge bg-primary text-white px-1.5 py-0.5 rounded text-2xs ms-auto">
                  {zoneStats.pendingTotal}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 5. Modul Keuangan / Finance */}
        {(hasAccess('Finance', 'view') || isMaster) && (
          <div className="mb-1">
            {isManagementTier ? (
              <div 
                className={`sidebar-link ${activeTab === 'finance-transactions' ? 'active' : ''}`}
                onClick={() => handleNavClick('finance-transactions')}
              >
                <span>Daftar Transaksi Kas</span>
              </div>
            ) : (
              <>
                <button 
                  type="button" 
                  className={`sidebar-dropdown-header ${['finance-pending', 'finance-transactions', 'finance-input', 'finance-google-docs'].includes(activeTab) ? 'text-primary' : ''}`}
                  onClick={() => toggleSection('finance')}
                >
                  <span className="fw-semibold">Finance</span>
                  {financeStats?.totalPending > 0 && (
                    <span className="badge bg-success px-1.5 py-0.5 rounded text-2xs ms-auto">
                      {financeStats.totalPending}
                    </span>
                  )}
                </button>

                {openSections.finance && (
                  <div className="sidebar-dropdown-body">
                    <div 
                      className={`sidebar-link py-1.5 ps-2 ${activeTab === 'finance-pending' ? 'active' : ''}`}
                      onClick={() => handleNavClick('finance-pending')}
                    >
                      <span>Pembayaran Pending</span>
                      {financeStats?.totalPending > 0 && (
                        <span className="badge bg-success px-1.5 py-0.5 rounded text-2xs ms-auto">
                          {financeStats.totalPending}
                        </span>
                      )}
                    </div>
                    <div 
                      className={`sidebar-link py-1.5 ps-2 ${activeTab === 'finance-transactions' ? 'active' : ''}`}
                      onClick={() => handleNavClick('finance-transactions')}
                    >
                      <span>Daftar Transaksi Kas</span>
                    </div>
                    <div 
                      className={`sidebar-link py-1.5 ps-2 ${activeTab === 'finance-google-docs' ? 'active' : ''}`}
                      onClick={() => handleNavClick('finance-google-docs')}
                    >
                      <span>Integrasi Google Docs</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 6. Akses Lapangan (User BBM) */}
        {!isManagementTier && (hasAccess('UserBBM', 'view') || isMaster) && (
          <div className="mb-1">
            <div 
              className={`sidebar-link ${activeTab === 'user-bbm-validation' ? 'active' : ''}`}
              onClick={() => handleNavClick('user-bbm-validation')}
            >
              <span>Validasi Nota BBM</span>
            </div>
          </div>
        )}

        {/* 7. Modul Karyawan / HRD */}
        {(hasAccess('HRD', 'view') || isMaster) && (
          <div className="mb-1">
            <div 
              className={`sidebar-link ${activeTab === 'employee-list' ? 'active' : ''}`}
              onClick={() => handleNavClick('employee-list')}
            >
              <span>List Karyawan</span>
              {employeesCount > 0 && (
                <span className="badge bg-secondary px-1.5 py-0.5 rounded text-2xs ms-auto">{employeesCount}</span>
              )}
            </div>
          </div>
        )}

        {/* 8. Modul Armada & Aset */}
        {(hasAccess('Vehicle', 'view') || isMaster) && (
          <div className="mb-1">
            <button 
              type="button" 
              className={`sidebar-dropdown-header ${['vehicle-list', 'asset-assignment'].includes(activeTab) ? 'text-primary' : ''}`}
              onClick={() => toggleSection('vehicle')}
            >
              <span className="fw-semibold">Armada</span>
              {vehiclesCount > 0 && (
                <span className="badge bg-secondary px-1.5 py-0.5 rounded text-2xs ms-auto">{vehiclesCount}</span>
              )}
            </button>

            {openSections.vehicle && (
              <div className="sidebar-dropdown-body">
                <div 
                  className={`sidebar-link py-1.5 ps-2 ${activeTab === 'vehicle-list' ? 'active' : ''}`}
                  onClick={() => handleNavClick('vehicle-list')}
                >
                  <span>Daftar Armada</span>
                </div>
                {(hasAccess('Vehicle', 'assign') || isMaster) && (
                  <div 
                    className={`sidebar-link py-1.5 ps-2 ${activeTab === 'asset-assignment' ? 'active' : ''}`}
                    onClick={() => handleNavClick('asset-assignment')}
                  >
                    <span>Penugasan Aset</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 9. Master Control Panel */}
        {isMaster && (
          <div className="mb-1">
            <button 
              type="button" 
              className={`sidebar-dropdown-header ${['master-users', 'master-settings'].includes(activeTab) ? 'text-primary' : ''}`}
              onClick={() => toggleSection('master')}
            >
              <span className="fw-semibold">Master Control Panel</span>
            </button>

            {openSections.master && (
              <div className="sidebar-dropdown-body">
                <div 
                  className={`sidebar-link py-1.5 ps-2 ${activeTab === 'master-users' ? 'active' : ''}`}
                  onClick={() => handleNavClick('master-users')}
                >
                  <span>Manajemen Pengguna</span>
                </div>
                <div 
                  className={`sidebar-link py-1.5 ps-2 ${activeTab === 'master-settings' ? 'active' : ''}`}
                  onClick={() => handleNavClick('master-settings')}
                >
                  <span>Matriks Otoritas &amp; API</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="sidebar-desktop d-none d-md-block">
        {navContent}
      </aside>

      <div 
        className={`offcanvas offcanvas-start bg-dark text-light ${mobileOpen ? 'show' : ''}`} 
        tabIndex="-1" 
        style={{ visibility: mobileOpen ? 'visible' : 'hidden', zIndex: 1045, width: '260px', backgroundColor: '#0b0f19' }}
      >
        <div className="offcanvas-body p-0">
          {navContent}
        </div>
      </div>

      {mobileOpen && (
        <div 
          className="offcanvas-backdrop fade show d-md-none" 
          onClick={onCloseMobile}
          style={{ zIndex: 1040 }}
        />
      )}
    </>
  );
}
