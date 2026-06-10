import { useState } from 'react';
import { AuthContext } from './useAuth';
import userService from '../services/userService';

// Auth provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => userService.getCurrentUser());

  const isAuthenticated = user !== null;

  const login = async (username, password) => {
    const result = await userService.login(username, password);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const register = async (username, password, options = {}) => {
    const result = await userService.register(username, password, options);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await userService.logout();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const result = await userService.updateProfile(updates);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
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
