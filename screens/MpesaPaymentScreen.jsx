import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchBadgePricing } from '../src/utils/badgePricing';
import { getToken } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

function normalizeMpesaNumber(number) {
  let n = number.trim();
  if (/^07\d{8}$/.test(n)) return '254' + n.slice(1);
  if (/^2547\d{8}$/.test(n)) return n;
  return null;
}

export default function MpesaPaymentScreen() {
  const navigation = useNavigation();
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [billingType, setBillingType] = useState('monthly');
  useEffect(() => {
    (async () => {
      const data = await fetchBadgePricing();
      setPricing(data);
    })();
  }, []);
  const amountKES = pricing
    ? (billingType === 'annual'
        ? Math.round(pricing.badgeAnnualUSD * pricing.usdToKes)
        : Math.round(pricing.badgeMonthlyUSD * pricing.usdToKes))
    : null;

  const handlePay = async () => {
    setError('');
    setLoading(true);
    const normalized = normalizeMpesaNumber(mpesaNumber);
    if (!normalized) {
      setError('Enter a valid M-Pesa number (07... or 2547...)');
      setLoading(false);
      return;
    }
    try {
      const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';
      const token = await getToken();
      // Get username from AsyncStorage
      let username = await AsyncStorage.getItem('username');
      if (!username) username = 'Customer';
      const payload = {
        phone_number: normalized,
        amount: amountKES,
        billingType,
        customer_name: username
      };
      console.log('Initiating payment with:', payload);
      const res = await fetch(`${API_BASE}/badge-payments/initiate-stk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      console.log('Response status:', res.status);
      let data = null;
      try {
        data = await res.json();
        console.log('Response data:', data);
      } catch (e) {
        console.log('Error parsing response:', e);
        setError('Unexpected server response.');
        setLoading(false);
        return;
      }
      if (!res.ok || !data.CheckoutRequestID) {
        console.log('Payment initiation failed:', data?.error);
        setError(data?.error || 'Failed to initiate payment.');
        setLoading(false);
        return;
      }
  Alert.alert('Payment Initiated', 'Please check your phone and enter M-pesa pin to confirm payment');
      navigation.navigate('PaymentsScreen');
    } catch (err) {
      console.log('Payment request error:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>M-Pesa Payment</Text>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <TouchableOpacity
          style={[styles.billingBtn, billingType === 'monthly' && styles.billingBtnActive]}
          onPress={() => setBillingType('monthly')}
          disabled={loading}
        >
          <Text style={billingType === 'monthly' ? styles.billingTextActive : styles.billingText}>Monthly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.billingBtn, billingType === 'annual' && styles.billingBtnActive]}
          onPress={() => setBillingType('annual')}
          disabled={loading}
        >
          <Text style={billingType === 'annual' ? styles.billingTextActive : styles.billingText}>Annual</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
        <View style={{ alignItems: 'center', marginRight: 16 }}>
          <Text style={styles.amountLabel}>Amount (USD)</Text>
          <TextInput
            style={styles.amountValueInput}
            value={pricing ? (billingType === 'annual'
              ? `$${Number(pricing.badgeAnnualUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `$${Number(pricing.badgeMonthlyUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`) : ''}
            editable={false}
            selectTextOnFocus={false}
          />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.amountLabel}>Amount (KES)</Text>
          <TextInput
            style={styles.amountValueInput}
            value={pricing ? (billingType === 'annual'
              ? `KES ${Math.round(pricing.badgeAnnualUSD * pricing.usdToKes).toLocaleString()}`
              : `KES ${Math.round(pricing.badgeMonthlyUSD * pricing.usdToKes).toLocaleString()}`) : ''}
            editable={false}
            selectTextOnFocus={false}
          />
        </View>
      </View>
      <TextInput
        style={styles.input}
        placeholder="M-Pesa Number (07... or 2547...)"
        value={mpesaNumber}
        onChangeText={setMpesaNumber}
        keyboardType="phone-pad"
        editable={!loading}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={loading || !amountKES}>
        <Text style={styles.payBtnText}>{loading ? 'Processing...' : 'Pay & Get Verified'}</Text>
      </TouchableOpacity>
      {loading && (
        <View style={styles.spinnerOverlay}>
          <ActivityIndicator size="large" color="#a99d6b" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  amountValueInput: { width: 120, backgroundColor: '#f7f8fa', borderRadius: 8, padding: 10, fontSize: 18, fontWeight: 'bold', color: '#a99d6b', textAlign: 'center', borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 2 },
  billingBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#e0e7ff', marginHorizontal: 4, alignItems: 'center' },
  billingBtnActive: { backgroundColor: '#a99d6b' },
  billingText: { color: '#1e3a8a', fontWeight: 'bold', fontSize: 16 },
  billingTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#f7f8fa' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 18 },
  input: { width: '100%', maxWidth: 320, backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 14, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  payBtn: { backgroundColor: '#a99d6b', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8, width: '100%' },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  error: { color: 'red', marginTop: 8, marginBottom: 8, textAlign: 'center' },
  amountLabel: { fontSize: 16, color: '#222', marginBottom: 4, fontWeight: '500' },
  amountValue: { fontSize: 22, color: '#a99d6b', fontWeight: 'bold', marginBottom: 18 },
  spinnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
