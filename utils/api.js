// Increment share count for a post
export async function incrementPostShareCount(postId) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/posts/${postId}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to increment share count');
  return res.json();
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE =
  (Constants.manifest?.extra?.API_BASE_URL ||
   Constants.expoConfig?.extra?.API_BASE_URL ||
   process.env.API_BASE_URL ||
   'http://192.168.100.37:5000/api');

async function getToken() {
  return await AsyncStorage.getItem('token');
}

export async function fetchPosts({ offset = 0, limit = 20 } = {}) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/posts?offset=${offset}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return await res.json();
}
