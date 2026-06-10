import { useState } from 'react';
import { AuthContext } from './useAuth';
import userService from '../services/userService';

// Auth provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => userService.getCurrentUser());

  const isAuthenticated = user !== null;

  const login = (username, password) => {
    const result = userService.login(username, password);
    if (result) {
      setUser(result);
      return { success: true };
    }
    return { success: false, error: '用户名或密码错误' };
  };

  const register = (username, password, options = {}) => {
    const result = userService.register(username, password, options);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = () => {
    userService.logout();
    setUser(null);
  };

  const updateProfile = (updates) => {
    const updatedUser = userService.updateProfile(updates);
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
