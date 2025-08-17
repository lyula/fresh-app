import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL;

// Save user notification preferences to backend
export async function saveNotificationPreferences(preferences) {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const res = await fetch(`${API_BASE}/user/notification-preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(preferences),
  });
  if (!res.ok) throw new Error('Failed to save preferences');
  return res.json();
}

// Fetch user notification preferences from backend
export async function getNotificationPreferences() {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const res = await fetch(`${API_BASE}/user/notification-preferences`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch preferences');
  return res.json();
}
