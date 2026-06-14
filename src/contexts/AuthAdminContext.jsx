import { createContext, useContext, useState, useEffect } from 'react';

const AuthAdminContext = createContext();

export function AuthAdminProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('adminUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem('adminToken') || null;
  });

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

export function useAuthAdmin() {
  return useContext(AuthAdminContext);
}
