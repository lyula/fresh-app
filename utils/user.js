import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE = process.env.API_BASE_URL || 'http://192.168.100.37:5000/api';

export async function getProfile() {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const res = await fetch(`${API_BASE}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}
