import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function PaypalPaymentScreen() {
  const navigation = useNavigation();
  const [paypalEmail, setPaypalEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setError('');
    setLoading(true);
    if (!paypalEmail) {
      setError('Enter your PayPal email');
      setLoading(false);
      return;
    }
    // API call for PayPal payment here
    Alert.alert('Payment Initiated', 'Check your PayPal for payment instructions.');
    setLoading(false);
    navigation.navigate('PaymentsScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PayPal Payment</Text>
      <TextInput
        style={styles.input}
        placeholder="PayPal Email"
        value={paypalEmail}
        onChangeText={setPaypalEmail}
        keyboardType="email-address"
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
