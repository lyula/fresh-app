export async function uploadToCloudinary(uri) {
  const data = new FormData();
  data.append('file', {
    uri,
    type: 'image/jpeg',
    name: 'profile.jpg',
  });
  data.append('upload_preset', 'YOUR_CLOUDINARY_PRESET'); // Replace with your preset
  const res = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUDINARY_CLOUD_NAME/upload', {
    method: 'POST',
    body: data,
  });
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
}
export async function updateProfile({ username, email, profile }) {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username, email, profile }),
  });
  return res.json();
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
const API_BASE = Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL;

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
