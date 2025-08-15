import AsyncStorage from '@react-native-async-storage/async-storage';
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL;

// Create a post (supports multiple images/videos)
export async function createPost({ content, images = [], videos = [] }) {
  const token = await AsyncStorage.getItem('token');
  const body = JSON.stringify({
    content,
    image: images[0] || '',
    video: videos[0] || '',
  });
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  if (!res.ok) throw new Error('Failed to create post');
  return await res.json();
}
