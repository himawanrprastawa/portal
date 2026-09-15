import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const DEFAULT_CUSTOM_ROLES = [
  {
    id: 'role_supervisor',
    name: 'Supervisor',
    badgeColor: 'warning',
    description: 'Input request comcase & rekapitulasi nota lapangan',
    isSystem: true,
    permissions: ['comcase_create', 'comcase_view', 'expense_view', 'vehicle_view']
  },
  {
    id: 'role_team_leader',
    name: 'Team Leader',
    badgeColor: 'cyan',
    description: 'Team Leader Lapangan (Input request comcase & validasi BBM)',
    isSystem: true,
    permissions: ['comcase_create', 'comcase_view', 'bbm_validation', 'vehicle_view', 'expense_view']
  },
  {
    id: 'role_zone_mgr',
    name: 'Zone Manager',
    badgeColor: 'indigo',
    description: 'Review & verifikasi pengajuan comcase zona serta pengajuan permohonan via PDF resmi (TTD Requester)',
    isSystem: true,
    permissions: ['inbox_view', 'inbox_comcase', 'inbox_external', 'zone_request_create', 'zone_request_view', 'zone_sign_requester', 'comcase_view', 'comcase_approve', 'expense_view', 'vehicle_view']
  },
  {
    id: 'role_manager',
    name: 'Manager',
    badgeColor: 'info',
    description: 'Otorisasi Manager (Inbox Persetujuan Comcase & TTD Permohonan External)',
    isSystem: true,
    permissions: ['inbox_view', 'inbox_comcase', 'inbox_external', 'comcase_view', 'comcase_approve', 'zone_request_view', 'zone_sign_manager', 'expense_view', 'hrd_employee_view', 'vehicle_view']
  },
  {
    id: 'role_gm',
    name: 'General Manager',
    badgeColor: 'purple',
    description: 'General Manager: View seluruh modul operasional, approval comcase, dan TTD Checker GM',
    isSystem: true,
    permissions: ['inbox_view', 'inbox_comcase', 'inbox_external', 'comcase_view', 'comcase_approve', 'zone_request_view', 'zone_sign_gm', 'expense_view', 'hrd_employee_view', 'vehicle_view']
  },
  {
    id: 'role_fin',
    name: 'Finance',
    badgeColor: 'success',
    description: 'Pencairan dana comcase & permohonan external, TTD Checker Finance, transaksi kas, & pembukuan',
    isSystem: true,
    permissions: ['inbox_comcase', 'inbox_external', 'comcase_view', 'comcase_pay', 'zone_request_view', 'zone_sign_finance', 'expense_view', 'expense_create', 'expense_edit', 'expense_delete', 'vehicle_view']
  },
  {
    id: 'role_direksi',
    name: 'Direksi',
    badgeColor: 'primary',
    description: 'Direksi & Owner: View seluruh modul operasional & kas, serta TTD Approval Final',
    isSystem: true,
    permissions: ['inbox_view', 'inbox_comcase', 'inbox_external', 'comcase_view', 'comcase_approve', 'zone_request_view', 'zone_sign_owner', 'expense_view', 'hrd_employee_view', 'vehicle_view']
  },
  {
    id: 'role_hrd',
    name: 'HRD',
    badgeColor: 'secondary',
    description: 'Manajemen data karyawan & armada operasional',
    isSystem: true,
    permissions: ['hrd_employee_view', 'hrd_employee_create', 'hrd_employee_edit', 'hrd_employee_delete', 'vehicle_view', 'vehicle_create', 'vehicle_edit', 'vehicle_delete', 'vehicle_logs', 'vehicle_assign']
  },
  {
    id: 'role_user',
    name: 'User',
    badgeColor: 'dark',
    description: 'Driver / Petugas Lapangan (Validasi BBM 3 Foto)',
    isSystem: true,
    permissions: ['bbm_validation', 'vehicle_view']
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bsm_session_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { username: 'master', role: 'Master', employee_name: 'Master Admin' };
  });

  const [customRoles, setCustomRoles] = useState(() => {
    try {
      const saved = localStorage.getItem('bsm_custom_roles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 6 && !parsed.some(r => r.name === 'Manager Operasional 2')) {
          return parsed.map(r => {
            let p = [...(r.permissions || [])];
            if ((r.id === 'role_hrd' || r.name === 'HRD') && !p.includes('vehicle_assign')) {
              p.push('vehicle_assign');
            }
            if (['role_manager', 'role_gm', 'role_direksi', 'role_zone_mgr'].includes(r.id)) {
              if (!p.includes('inbox_view')) p.push('inbox_view');
              if (!p.includes('inbox_comcase')) p.push('inbox_comcase');
              if (!p.includes('inbox_external')) p.push('inbox_external');
            }
            if (r.id === 'role_fin') {
              if (!p.includes('inbox_comcase')) p.push('inbox_comcase');
              if (!p.includes('inbox_external')) p.push('inbox_external');
            }
            return { ...r, permissions: p };
          });
        }
      }
    } catch (e) {}
    return DEFAULT_CUSTOM_ROLES;
  });

  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const login = async (username, password) => {
    try {
      const res = await api.login(username, password);
      if (res && res.success) {
        const user = res.data;
        setCurrentUser(user);
        localStorage.setItem('bsm_session_user', JSON.stringify(user));
        showToast(`Selamat datang, ${user.employee_name || user.username}!`, 'success');
        return { success: true };
      }
      return { success: false, message: res.message || 'Login gagal.' };
    } catch (err) {
      // Fallback demo user
      const demoUsers = {
        'master': { username: 'master', role: 'Master', employee_name: 'Master Admin' },
        'pandu': { username: 'pandu', role: 'Manager', employee_name: 'Pandu (Manager)' },
        'boya': { username: 'boya', role: 'Zone Manager', employee_name: 'Boya (Zone Manager)' },
        'cristian': { username: 'cristian', role: 'Supervisor', employee_name: 'Cristian (Supervisor)' },
        'himawan': { username: 'himawan', role: 'Finance', employee_name: 'Himawan (Finance)' },
        'septika': { username: 'septika', role: 'HRD', employee_name: 'Septika (HRD)' },
        'gm': { username: 'gm', role: 'General Manager', employee_name: 'General Manager' },
        'direksi': { username: 'direksi', role: 'Direksi', employee_name: 'Direksi Utama' },
        'tl': { username: 'tl', role: 'Team Leader', employee_name: 'Ahmad Fauzi (Team Leader)' },
        'driver': { username: 'driver', role: 'User', employee_name: 'Joko Santoso (Driver Lapangan)' },
        'lapangan': { username: 'lapangan', role: 'User', employee_name: 'Joko Santoso (Driver Lapangan)' }
      };
      const u = demoUsers[username.toLowerCase()] || { username, role: 'User', employee_name: username };
      setCurrentUser(u);
      localStorage.setItem('bsm_session_user', JSON.stringify(u));
      showToast(`Login demo berhasil sebagai ${u.role}.`, 'success');
      return { success: true };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bsm_session_user');
    showToast('Anda telah keluar dari portal.', 'info');
  };

  // Dynamic Role Access Checker (RBAC strictly grounded on customRoles permission matrix)
  const hasAccess = (module, action = 'view') => {
    if (!currentUser) return false;
    const roleName = (currentUser.role || '').toLowerCase().trim();
    if (roleName.includes('master') || roleName.includes('admin')) return true;

    // Strict rule for Manager, General Manager, & Direksi: NO INPUT/CREATE/EDIT/DELETE except online signature and approval
    const isExecutiveOrManager = (
      (!roleName.includes('zone') && (roleName === 'manager' || roleName.includes('manager ops'))) ||
      roleName.includes('general manager') ||
      roleName === 'gm' ||
      roleName.includes('direksi') ||
      roleName.includes('owner') ||
      roleName.includes('direktur')
    );
    if (isExecutiveOrManager) {
      if (['create', 'edit', 'delete', 'pay', 'input', 'status', 'add', 'revisi'].includes(action)) return false;
    }

    // Match role from customRoles permission matrix
    const matchedRole = customRoles.find(r => 
      (r.name && r.name.toLowerCase().trim() === roleName) ||
      (r.id && r.id.toLowerCase().trim() === roleName) ||
      (roleName.includes('team leader') && (r.id === 'role_team_leader' || (r.name && r.name.toLowerCase().includes('leader')))) ||
      (roleName === 'tl' && r.id === 'role_team_leader') ||
      (roleName.includes('zone') && (r.id === 'role_zone_mgr' || (r.name && r.name.toLowerCase().includes('zone')))) ||
      (!roleName.includes('zone') && (roleName === 'manager' || roleName.includes('manager ops')) && (r.id === 'role_manager' || r.id === 'role_mgr1')) ||
      (roleName.includes('supervisor') && (r.id === 'role_supervisor' || r.id === 'role_spv')) ||
      (roleName.includes('general manager') && r.id === 'role_gm') ||
      (roleName.includes('direksi') && r.id === 'role_direksi') ||
      (roleName.includes('finance') && r.id === 'role_fin') ||
      (roleName.includes('hrd') && r.id === 'role_hrd') ||
      (roleName.includes('user') && r.id === 'role_user') ||
      (roleName.includes('driver') && r.id === 'role_user') ||
      (roleName.includes('lapangan') && r.id === 'role_user')
    );

    if (matchedRole && Array.isArray(matchedRole.permissions)) {
      const perms = matchedRole.permissions;
      
      // HRD & Employee
      if (module === 'HRD' || module === 'Employee') {
        if (action === 'create') return perms.includes('hrd_employee_create');
        if (action === 'edit') return perms.includes('hrd_employee_edit');
        if (action === 'delete') return perms.includes('hrd_employee_delete');
        return perms.includes('hrd_employee_view');
      }

      // Vehicle & Armada
      if (module === 'Vehicle') {
        if (action === 'create') return perms.includes('vehicle_create');
        if (action === 'edit') return perms.includes('vehicle_edit');
        if (action === 'delete') return perms.includes('vehicle_delete');
        if (action === 'assign') return perms.includes('vehicle_assign');
        return perms.includes('vehicle_view');
      }

      // Supervisor & Comcase
      if (module === 'Supervisor' || module === 'ComcaseRequest' || module === 'Comcase') {
        if (action === 'create') return perms.includes('comcase_create');
        if (action === 'edit') return perms.includes('comcase_create');
        if (action === 'approve') return perms.includes('comcase_approve');
        return perms.includes('comcase_view') || perms.includes('comcase_create');
      }

      // Kotak Masuk (Inbox), Data Comcase, & Data External
      if (module === 'Inbox' || module === 'KotakMasuk') {
        if (action === 'view' || action === 'inbox') {
          return perms.includes('inbox_view');
        }
        if (action === 'comcase') {
          return perms.includes('inbox_comcase');
        }
        if (action === 'external') {
          return perms.includes('inbox_external');
        }
        return perms.includes('inbox_view') || perms.includes('inbox_comcase') || perms.includes('inbox_external');
      }

      // Manager & Approval (Strictly Manager Tier only, NEVER Zone Manager)
      if (module === 'Manager' || module === 'ComcaseApproval') {
        if (roleName.includes('zone')) return false;
        if (action === 'approve') return perms.includes('comcase_approve');
        if (action === 'sign_manager') return perms.includes('zone_sign_manager');
        if (action === 'sign_gm') return perms.includes('zone_sign_gm');
        if (action === 'sign_owner') return perms.includes('zone_sign_owner');
        return perms.includes('comcase_approve') || perms.includes('zone_sign_manager') || perms.includes('zone_sign_gm') || perms.includes('zone_sign_owner');
      }

      // Finance & Kas Operasional
      if (module === 'Finance' || module === 'FinancePayment' || module === 'Expense') {
        if (action === 'create') return perms.includes('expense_create');
        if (action === 'edit') return perms.includes('expense_edit');
        if (action === 'delete') return perms.includes('expense_delete') || perms.includes('expense_create');
        if (action === 'pay') return perms.includes('comcase_pay');
        if (action === 'sign_finance') return perms.includes('zone_sign_finance');
        return perms.includes('expense_view') || perms.includes('comcase_pay') || perms.includes('expense_create');
      }

      // Zone Manager & Permohonan External (Strictly Zone Tier only)
      if (module === 'ZoneManager' || module === 'ZoneRequest' || module === 'Zone') {
        if (!roleName.includes('zone') && !roleName.includes('master')) return false;
        if (action === 'create') return perms.includes('zone_request_create');
        if (action === 'sign_requester') return perms.includes('zone_sign_requester') || perms.includes('zone_request_create');
        return perms.includes('zone_request_view') || perms.includes('zone_request_create') || perms.includes('comcase_review_zone');
      }

      // User & Validasi BBM
      if (module === 'User' || module === 'UserBBM' || module === 'BBM') {
        return perms.includes('bbm_validation');
      }

      if (module === 'ComcaseList') {
        return perms.includes('comcase_view') || perms.includes('comcase_create') || perms.includes('comcase_approve');
      }
    }

    return false;
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      customRoles,
      setCustomRoles,
      hasAccess,
      login,
      logout,
      toasts,
      showToast,
      removeToast,
      formatCurrency
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
