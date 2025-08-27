import { createContext, useContext } from 'react';

// 1. Create and export the context here
export const AuthContext = createContext();

// 2. Create and export the hook here
export const useAuth = () => {
  return useContext(AuthContext);
};