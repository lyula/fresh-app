// Utility to fetch badge pricing from API
export async function fetchBadgePricing() {
  try {
    const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';
    const response = await fetch(`${API_BASE}/badge-pricing`);
    if (!response.ok) throw new Error('Failed to fetch badge pricing');
    return await response.json();
  } catch (err) {
    return null;
  }
}
