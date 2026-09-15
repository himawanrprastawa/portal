import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, Inbox, CreditCard, Menu } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenMobileMenu, inboxStats, financeStats }) {
  const { hasAccess } = useAuth();

  return (
    <nav className="mobile-bottom-nav d-md-none">
      <div 
        className={`mobile-bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </div>

      <div 
        className={`mobile-bottom-nav-item ${activeTab === 'comcase-list' ? 'active' : ''}`}
        onClick={() => setActiveTab('comcase-list')}
      >
        <FileText size={20} />
        <span>Comcase</span>
      </div>

      {hasAccess('Manager') && (
        <div 
          className={`mobile-bottom-nav-item ${activeTab === 'manager-inbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('manager-inbox')}
        >
          <Inbox size={20} />
          <span>Inbox</span>
          {inboxStats?.totalPending > 0 && (
            <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
              {inboxStats.totalPending}
            </span>
          )}
        </div>
      )}

      {hasAccess('Finance') && (
        <div 
          className={`mobile-bottom-nav-item ${activeTab === 'finance-pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('finance-pending')}
        >
          <CreditCard size={20} />
          <span>Finance</span>
          {financeStats?.totalPending > 0 && (
            <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success" style={{ fontSize: '0.6rem' }}>
              {financeStats.totalPending}
            </span>
          )}
        </div>
      )}

      <div 
        className="mobile-bottom-nav-item"
        onClick={onOpenMobileMenu}
      >
        <Menu size={20} />
        <span>Menu</span>
      </div>
    </nav>
  );
}

