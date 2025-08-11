import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getProfile } from '../utils/user';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    setLoadingUser(true);
    getProfile()
      .then(profile => {
        setUser(profile);
        setUserId(profile._id || profile.id);
      })
      .catch(() => {
        setUser(null);
        setUserId(null);
      })
      .finally(() => setLoadingUser(false));
  }, []);

  const value = useMemo(() => ({
    user,
    userId,
    loadingUser,
    setUser,
  }), [user, userId, loadingUser]);

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
