import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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

  const handlePay = async () => {
    setError('');
    setLoading(true);
    const normalized = normalizeMpesaNumber(mpesaNumber);
    if (!normalized) {
      setError('Enter a valid M-Pesa number (07... or 2547...)');
      setLoading(false);
      return;
    }
    // API call for M-Pesa payment here
    Alert.alert('Payment Initiated', 'Follow the instructions on your phone to complete payment.');
    setLoading(false);
    navigation.navigate('PaymentsScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>M-Pesa Payment</Text>
      <TextInput
        style={styles.input}
        placeholder="M-Pesa Number (07... or 2547...)"
        value={mpesaNumber}
        onChangeText={setMpesaNumber}
        keyboardType="phone-pad"
        editable={!loading}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={loading}>
        <Text style={styles.payBtnText}>{loading ? 'Processing...' : 'Pay & Get Verified'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#f7f8fa' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 18 },
  input: { width: '100%', maxWidth: 320, backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 14, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  payBtn: { backgroundColor: '#a99d6b', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8, width: '100%' },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  error: { color: 'red', marginTop: 8, marginBottom: 8, textAlign: 'center' },
});
