// Fetch user's ads (matching client logic)
export async function getUserAds() {
  const token = await getToken();
  const API_BASE_MAIN = Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL;
  const res = await fetch(`${API_BASE_MAIN}/ads`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  console.log('API /ads response:', result);
  if (res.ok && result.success) {
    if (Array.isArray(result.data)) return result.data;
    if (result.data?.ads) return result.data.ads;
    return [];
  } else if (Array.isArray(result)) {
    return result;
  } else {
    throw new Error(result.message || 'Failed to fetch ads');
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
const API_BASE = (Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL) + '/ad-interactions';

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
