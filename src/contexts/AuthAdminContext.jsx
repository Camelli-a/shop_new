import { useCallback, useEffect, useState } from 'react';
import { AuthAdminContext } from './useAuthAdmin';

const ADMIN_STORAGE_KEYS = {
  roles: 'adminRoles',
  accounts: 'adminAccounts',
};

function safeParseJson(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function loadAdminRoles() {
  const roles = safeParseJson(localStorage.getItem(ADMIN_STORAGE_KEYS.roles), []);
  return Array.isArray(roles) ? roles : [];
}

function saveAdminRoles(roles) {
  localStorage.setItem(ADMIN_STORAGE_KEYS.roles, JSON.stringify(roles));
}

function loadAdminAccounts() {
  const accounts = safeParseJson(localStorage.getItem(ADMIN_STORAGE_KEYS.accounts), []);
  return Array.isArray(accounts) ? accounts : [];
}

function saveAdminAccounts(accounts) {
  localStorage.setItem(ADMIN_STORAGE_KEYS.accounts, JSON.stringify(accounts));
}

function normalizeAdminUserWithRoles(user) {
  if (!user?.roleId) return user;
  const roles = loadAdminRoles();
  const role = roles.find((r) => r?.id === user.roleId);
  if (!role) return user;

  return {
    ...user,
    roleName: role.name,
    permissions: Array.isArray(role.permissions) ? role.permissions : [],
  };
}

function seedAdminMockDataIfNeeded() {
  const existingRoles = loadAdminRoles();
  const existingAccounts = loadAdminAccounts();

  const now = new Date().toISOString();

  if (existingRoles.length === 0) {
    saveAdminRoles([
      {
        id: 1,
        name: '超级管理员',
        description: '拥有后台全部权限',
        permissions: ['dashboard', 'goods', 'categories', 'orders', 'users', 'roles'],
        createTime: now,
      },
      {
        id: 2,
        name: '商品管理员',
        description: '仅管理商品与分类',
        permissions: ['dashboard', 'goods', 'categories'],
        createTime: now,
      },
      {
        id: 3,
        name: '订单管理员',
        description: '仅管理订单',
        permissions: ['dashboard', 'orders'],
        createTime: now,
      },
    ]);
  }

  if (existingAccounts.length === 0) {
    saveAdminAccounts([
      {
        id: 1,
        username: 'admin1',
        password: '123456',
        name: 'admin1',
        avatar: 'https://via.placeholder.com/40',
        roleId: 1,
      },
      {
        id: 2,
        username: 'admin2',
        password: '123456',
        name: 'admin2',
        avatar: 'https://via.placeholder.com/40',
        roleId: 2,
      },
      {
        id: 3,
        username: 'admin3',
        password: '123456',
        name: 'admin3',
        avatar: 'https://via.placeholder.com/40',
        roleId: 3,
      },
    ]);
  }
}

if (typeof window !== 'undefined' && window?.localStorage) {
  try {
    seedAdminMockDataIfNeeded();
  } catch {
    // ignore
  }
}

export function AuthAdminProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('adminUser');
      const parsed = saved ? JSON.parse(saved) : null;
      return normalizeAdminUserWithRoles(parsed);
    } catch {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem('adminToken') || null;
  });

  const refreshAdminUserPermissions = useCallback(() => {
    if (!adminUser?.roleId) return;

    const roles = loadAdminRoles();
    const role = roles.find((r) => r?.id === adminUser.roleId);
    if (!role) return;

    const nextPermissions = Array.isArray(role.permissions) ? role.permissions : [];
    const currentPermissions = Array.isArray(adminUser.permissions) ? adminUser.permissions : [];

    const permissionsChanged =
      nextPermissions.length !== currentPermissions.length ||
      nextPermissions.some((p) => !currentPermissions.includes(p));

    const roleNameChanged = adminUser.roleName !== role.name;

    if (!permissionsChanged && !roleNameChanged) return;

    const nextUser = {
      ...adminUser,
      roleName: role.name,
      permissions: nextPermissions,
    };

    setAdminUser(nextUser);
    localStorage.setItem('adminUser', JSON.stringify(nextUser));
  }, [adminUser]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== ADMIN_STORAGE_KEYS.roles) return;
      refreshAdminUserPermissions();
    };

    const handleCustom = () => refreshAdminUserPermissions();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('adminRolesUpdated', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('adminRolesUpdated', handleCustom);
    };
  }, [refreshAdminUserPermissions]);

  const login = (userData, token) => {
    setAdminUser(userData);
    setAdminToken(token);
    localStorage.setItem('adminUser', JSON.stringify(userData));
    localStorage.setItem('adminToken', token);
  };

  const logout = () => {
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
  };

  const hasPermission = (permissionKey) => {
    if (!adminUser?.permissions) return false;
    return adminUser.permissions.includes(permissionKey);
  };

  // 权限映射：菜单 key 到权限 key
  const permissionMap = {
    'home': 'dashboard',
    'products': 'goods',
    'categories': 'categories',
    'orders': 'orders',
    'users': 'users',
    'roles': 'roles',
  };

  const hasMenuPermission = (menuKey) => {
    const permissionKey = permissionMap[menuKey];
    return hasPermission(permissionKey);
  };

  return (
    <AuthAdminContext.Provider
      value={{
        adminUser,
        adminToken,
        isLoggedIn: !!adminToken,
        login,
        logout,
        hasPermission,
        hasMenuPermission,
      }}
    >
      {children}
    </AuthAdminContext.Provider>
  );
}
