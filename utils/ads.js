
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
const API_BASE = Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL;

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
