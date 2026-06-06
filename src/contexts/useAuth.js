import { createContext, useContext } from 'react';

// Create auth context
export const AuthContext = createContext();

// Custom hook for convenience
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
