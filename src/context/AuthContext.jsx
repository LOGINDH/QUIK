import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.getUser());
  const [provider, setProvider] = useState(() => storage.getProvider());
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync state when storage changes across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(storage.getUser());
      setProvider(storage.getProvider());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loginUserSession = (userData, ads = []) => {
    // Ensure role is explicitly user
    const normalizedUser = {
      ...userData,
      role: 'user',
    };
    storage.setUser(normalizedUser);
    setUser(normalizedUser);
    if (ads && Array.isArray(ads)) {
      setAdvertisements(ads);
    }
  };

  const loginProviderSession = (providerData, serviceType) => {
    // Ensure role is explicitly provider and attach service_type
    const normalizedProvider = {
      ...providerData,
      role: 'provider',
      service_type: serviceType || providerData.service_type || 'auto',
    };
    storage.setProvider(normalizedProvider);
    setProvider(normalizedProvider);
  };

  const logoutUser = () => {
    storage.removeUser();
    storage.removeActiveBooking();
    setUser(null);
  };

  const logoutProvider = () => {
    storage.removeProvider();
    setProvider(null);
  };

  const logout = () => {
    storage.clearAll();
    setUser(null);
    setProvider(null);
  };

  const value = {
    user,
    provider,
    isUserAuthenticated: !!user,
    isProviderAuthenticated: !!provider,
    advertisements,
    setAdvertisements,
    loginUserSession,
    loginProviderSession,
    logoutUser,
    logoutProvider,
    logout,
    loading,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
