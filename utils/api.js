import AsyncStorage from '@react-native-async-storage/async-storage';
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL;

// Get latest badge payment (client logic)
export async function getLatestBadgePayment() {
  const token = await AsyncStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE}/badge-payments/latest`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.log('[getLatestBadgePayment] Fetch failed:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    console.log('[getLatestBadgePayment] Response:', data);
    return data;
  } catch (err) {
    console.log('[getLatestBadgePayment] Error:', err);
    return null;
  }
}
// Robust payment fetching functions (matching client logic)
export async function getBadgePayments(tokenOverride = null) {
  const token = tokenOverride || await getToken();
  const res = await fetch(`${API_BASE}/badge-payments/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data ? [data] : []);
}

export async function getJournalPayments(tokenOverride = null) {
  const token = tokenOverride || await getToken();
  const res = await fetch(`${API_BASE}/journal-payments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data ? [data] : []);
}
// Fetch profile suggestions for the current user
// Match client API: /user/suggestions/:userId
export async function getProfileSuggestions(userId, count = 100, filter = '', search = '', page = 1) {
  const token = await getToken();
  const params = new URLSearchParams({
    count: count.toString(),
    filter,
    search,
    page: page.toString(),
  });
  const res = await fetch(`${API_BASE}/user/suggestions/${userId}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch profile suggestions');
  return await res.json();
}
// Fetch profile images for a list of user IDs or usernames (copied from web client)
export async function getProfileImages({ userIds = [], usernames = [] }) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/user/profile-images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userIds, usernames }),
  });
  if (!res.ok) throw new Error('Failed to fetch profile images');
  return res.json();
}
// --- Messaging API (copied from client web logic) ---
// Get all conversations
export async function getConversations() {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/message`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

// Get conversation with a user
export async function getConversation(userId) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/message/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch conversation');
  return res.json();
}
// Like a post (same as the-app)
export async function likePost(postId) {
  const token = await AsyncStorage.getItem('token');
  const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to like post');
  return res.json();
}
// Get all comments for a post (for counting on client side)
export async function getPostComments(postId) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch post comments');
  const data = await res.json();
  // Web expects { comments: [...] } or array
  if (Array.isArray(data.comments)) return data.comments;
  if (Array.isArray(data)) return data;
  // If the response is a single comment, wrap in array
  if (data && typeof data === 'object') return [data];
  return [];
}
// Get users who liked a post
export async function getPostLikes(postId, limit = 100) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/posts/${postId}/likes?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch post likes');
  return res.json();
}
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
// Browse users with optional filters
export async function browseUsers({ search = '', filter = 'recommended', page = 1, limit = 20, tokenOverride = null }) {
  const token = tokenOverride || await getToken();
  const params = new URLSearchParams({
    search,
    filter,
    page: page.toString(),
    limit: limit.toString(),
  });
  const res = await fetch(`${API_BASE}/user/browse?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to browse users');
  return await res.json();
}


export async function getToken() {
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
