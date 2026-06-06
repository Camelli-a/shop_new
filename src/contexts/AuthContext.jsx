import { createContext, useContext, useState } from 'react';
import userService from '../services/userService';

// Create auth context
const AuthContext = createContext();

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
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for convenience
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, AuthProvider, useAuth };
