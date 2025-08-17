import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const API_BASE = Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL;

  // Poll notifications every 3 seconds
  useEffect(() => {
    let isMounted = true;
    let intervalId;
    async function fetchNotifications() {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE}/user/notifications`, { headers });
        if (res.ok) {
          const result = await res.json();
          if (isMounted) {
            setNotifications(result.notifications || result || []);
            // Count unread notifications
            const unread = (result.notifications || result || []).filter(n => !n.read).length;
            setUnreadCount(unread);
          }
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      }
    }
    fetchNotifications();
    intervalId = setInterval(fetchNotifications, 3000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [API_BASE]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await fetch(`${API_BASE}/user/notifications/mark-read`, { method: 'POST', headers });
      setUnreadCount(0);
    } catch {}
  }, [API_BASE]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
}
