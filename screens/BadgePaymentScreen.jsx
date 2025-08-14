import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/user';

const PAYMENT_OPTIONS = [
  { key: 'mpesa', label: 'M-Pesa', logo: 'https://inspireip.com/wp-content/uploads/2022/12/m-pesa.png' },
  { key: 'paypal', label: 'PayPal', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/39/PayPal_logo.svg' },
  { key: 'stripe', label: 'Stripe', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Stripe_Logo%2C_revised_2016.svg' },
  { key: 'card', label: 'Visa / MasterCard', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png' },
];

export default function BadgePaymentScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [selected, setSelected] = useState('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [stripeToken, setStripeToken] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function normalizeMpesaNumber(number) {
    let n = number.trim();
    if (/^07\d{8}$/.test(n)) return '254' + n.slice(1);
    if (/^2547\d{8}$/.test(n)) return n;
    return null;
  }

  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      if (selected === 'mpesa') {
        const normalized = normalizeMpesaNumber(mpesaNumber);
        if (!normalized) throw new Error('Enter a valid M-Pesa number (07... or 2547...)');
        // API call for M-Pesa
        // ...existing code...
        Alert.alert('Payment Initiated', 'Follow the instructions on your phone to complete payment.');
      } else if (selected === 'paypal') {
        if (!paypalEmail) throw new Error('Enter your PayPal email');
        // API call for PayPal
        Alert.alert('Payment Initiated', 'Check your PayPal for payment instructions.');
      } else if (selected === 'stripe') {
        if (!stripeToken) throw new Error('Enter your Stripe token');
        // API call for Stripe
        Alert.alert('Payment Initiated', 'Check your Stripe account for payment instructions.');
      } else if (selected === 'card') {
        if (!cardNumber || !expiry || !cvc) throw new Error('Enter all card details');
        // API call for Card
        Alert.alert('Payment Initiated', 'Check your card statement for payment confirmation.');
      }
      navigation.navigate('PaymentsScreen');
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/blue-badge.png')} style={styles.badgeImage} />
      <Text style={styles.title}>Verification Badge Payment</Text>
      <Text style={styles.subtitle}>Choose your payment method:</Text>
      <View style={styles.optionsCol}>
        {PAYMENT_OPTIONS.map((opt, idx) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.optionBtn, selected === opt.key && styles.selectedOption, idx > 0 && { marginTop: 16 }]}
            onPress={() => setSelected(opt.key)}
            disabled={loading}
          >
            <View style={styles.logoRow}>
              <Image source={{ uri: opt.logo }} style={styles.logoImg} />
              <Text style={[styles.optionText, selected === opt.key && styles.selectedText]}>{opt.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {selected === 'mpesa' && (
        <TextInput
          style={styles.input}
          placeholder="M-Pesa Number (07... or 2547...)"
          value={mpesaNumber}
          onChangeText={setMpesaNumber}
          keyboardType="phone-pad"
          editable={!loading}
        />
      )}
      {selected === 'paypal' && (
        <TextInput
          style={styles.input}
          placeholder="PayPal Email"
          value={paypalEmail}
          onChangeText={setPaypalEmail}
          keyboardType="email-address"
          editable={!loading}
        />
      )}
      {selected === 'stripe' && (
        <TextInput
          style={styles.input}
          placeholder="Stripe Token"
          value={stripeToken}
          onChangeText={setStripeToken}
          editable={!loading}
        />
      )}
      {selected === 'card' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="number-pad"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="MM/YY"
            value={expiry}
            onChangeText={setExpiry}
            keyboardType="number-pad"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="CVC"
            value={cvc}
            onChangeText={setCvc}
            keyboardType="number-pad"
            editable={!loading}
          />
        </>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={[styles.payBtn, { backgroundColor: '#a99d6b' }]} onPress={handlePay} disabled={loading}>
        <Text style={styles.payBtnText}>{loading ? 'Processing...' : 'Pay & Get Verified'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#f7f8fa' },
  badgeImage: { width: 80, height: 80, marginBottom: 18 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#222', marginBottom: 18, textAlign: 'center' },
  input: { width: '100%', maxWidth: 320, backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 14, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  optionsCol: { flexDirection: 'column', justifyContent: 'center', marginBottom: 18, width: '100%' },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoImg: { width: 32, height: 32, marginRight: 12, resizeMode: 'contain' },
  optionBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#e0e7ff', marginHorizontal: 6 },
  selectedOption: { backgroundColor: '#a99d6b', opacity: 0.92 },
  optionText: { color: '#1e3a8a', fontWeight: 'bold', fontSize: 16 },
  selectedText: { color: '#fff' },
  payBtn: { backgroundColor: '#1e3a8a', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8, width: '100%' },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  error: { color: 'red', marginTop: 8, marginBottom: 8, textAlign: 'center' },
});
