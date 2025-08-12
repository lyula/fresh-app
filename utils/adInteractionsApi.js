import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE = (process.env.API_BASE_URL || 'http://192.168.100.37:5000/api') + '/ad-interactions';

async function getToken() {
  return await AsyncStorage.getItem('token');
}

export async function getAdInteractions(adId) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/${adId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error('Failed to fetch ad interactions');
  return res.json();
}

export async function likeAd(adId) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/${adId}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to like ad');
  return res.json();
}

export async function viewAd(adId) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/${adId}/view`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to track ad view');
  return res.json();
}
