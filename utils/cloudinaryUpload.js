// fresh-app/utils/cloudinaryUpload.js
// Uploads a file to Cloudinary and returns the uploaded file URL
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export async function uploadToCloudinary(uri, type = 'auto', folder = '') {
  const data = new FormData();
  let fileType = type;
  let fileName = uri.split('/').pop();

  // For React Native, fetch the file as blob
  let fileObj = {
    uri,
    type: fileType === 'auto' ? (uri.match(/\.(mp4|mov|avi)$/) ? 'video/mp4' : 'image/jpeg') : fileType,
    name: fileName,
  };
  data.append('file', fileObj);
  const uploadPreset = Constants.expoConfig?.extra?.CLOUDINARY_UPLOAD_PRESET;
  const cloudName = Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME;
  data.append('upload_preset', uploadPreset);
  if (folder) data.append('folder', folder);
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: data,
    });
    const result = await res.json();
    if (result.secure_url) return result.secure_url;
    throw new Error(result.error?.message || 'Upload failed');
  } catch (err) {
    throw err;
  }
}
