import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE = process.env.API_BASE_URL || 'http://192.168.100.37:5000/api';

async function getToken() {
  return await AsyncStorage.getItem('token');
}

export async function fetchAds() {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/ads/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch ads');
  return res.json();
}
