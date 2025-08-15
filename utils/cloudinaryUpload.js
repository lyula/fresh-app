// fresh-app/utils/cloudinaryUpload.js
// Uploads a file to Cloudinary and returns the uploaded file URL
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export async function uploadToCloudinary(uri, type = 'auto', folder = '') {
  const data = new FormData();
  let fileType = type;
  let fileName = uri.split('/').pop();

  // Correct MIME type for Cloudinary
  let mimeType = 'image/jpeg';
  if (fileType === 'video' || uri.match(/\.(mp4|mov|avi)$/)) {
    mimeType = 'video/mp4';
  }
  let fileObj = {
    uri,
    type: mimeType,
    name: fileName,
  };
  data.append('file', fileObj);
  const uploadPreset = Constants.expoConfig?.extra?.CLOUDINARY_UPLOAD_PRESET;
  const cloudName = Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME;
  // Debug logging
  console.log('Cloudinary upload:', { cloudName, uploadPreset, uri, fileObj });
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

export async function deleteFromCloudinary(uploadedUri) {
  // Extract public_id from the Cloudinary URL
  try {
    const matches = uploadedUri.match(/\/([^\/]+)\.[a-zA-Z]+$/);
    if (!matches) throw new Error('Could not extract public_id from URL');
    const publicId = matches[1];
    const cloudName = Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME;
    // You need a backend endpoint or admin API key to delete from Cloudinary securely
    // This is a placeholder for a backend call
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?public_ids[]=${publicId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    console.log('Cloudinary delete result:', result);
    return result;
  } catch (err) {
    console.log('Cloudinary delete error:', err);
    throw err;
  }
}
