export async function uploadToCloudinary(uri) {
  const data = new FormData();
  data.append('file', {
    uri,
    type: 'image/jpeg',
    name: 'profile.jpg',
  });
  const cloudName = Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME || Constants.manifest?.extra?.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = Constants.expoConfig?.extra?.CLOUDINARY_UPLOAD_PRESET || Constants.manifest?.extra?.CLOUDINARY_UPLOAD_PRESET;
  data.append('upload_preset', uploadPreset);
  console.log('Uploading to Cloudinary...');
  console.log('Cloud name:', cloudName);
  console.log('Upload preset:', uploadPreset);
  console.log('File URI:', uri);
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Cloudinary response status:', res.status);
    const result = await res.json();
    console.log('Cloudinary response JSON:', result);
    if (!res.ok) throw new Error(result.error?.message || 'Failed to upload image');
    return result;
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    throw err;
  }
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
