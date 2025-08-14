// Utility for M-Pesa STK push
export async function initiateMpesaSTK({ phone_number, amount, customer_name }) {
  try {
    const API_BASE = process.env.EXPO_PUBLIC_API_URL || process.env.API_BASE || '';
    const url = `${API_BASE}/badge-payments/initiate-stk`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number, amount, customer_name })
    });
    const data = await response.json();
    if (!response.ok || !data.CheckoutRequestID) {
      throw new Error(data?.error || 'Failed to initiate payment.');
    }
    return data;
  } catch (err) {
    throw new Error(err.message || 'Payment failed');
  }
}
