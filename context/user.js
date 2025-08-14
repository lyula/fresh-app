import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getProfile } from '../utils/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Refresh user profile from API
  const refreshUser = useCallback(async () => {
    setLoadingUser(true);
    try {
      const profile = await getProfile();
      setUser(profile);
      setUserId(profile._id || profile.id);
    } catch {
      setUser(null);
      setUserId(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Logout function
  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
    setUserId(null);
    // Force context refresh after logout
    await refreshUser();
  }, [refreshUser]);

  const value = useMemo(() => ({
    user,
    userId,
    loadingUser,
    setUser,
    refreshUser,
    logout,
  }), [user, userId, loadingUser, refreshUser, logout]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
