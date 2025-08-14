import React, { useState, useEffect } from 'react';
import { getToken } from '../utils/api';
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
  const [loading, setLoading] = useState(false);
  const [badgeExpiry, setBadgeExpiry] = useState(null);
  useEffect(() => {
    (async () => {
      if (user?.verified) {
        const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';
        const token = await getToken();
        try {
          const res = await fetch(`${API_BASE}/badge-payments/latest`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const badge = await res.json();
            if (badge?.periodEnd) setBadgeExpiry(badge.periodEnd);
          }
        } catch {}
      }
    })();
  }, [user]);

  const handleOptionPress = (key) => {
    if (key === 'mpesa') navigation.navigate('MpesaPaymentScreen');
    else if (key === 'paypal') navigation.navigate('PaypalPaymentScreen');
    else if (key === 'stripe') navigation.navigate('StripePaymentScreen');
    else if (key === 'card') navigation.navigate('CardPaymentScreen');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/blue-badge.png')} style={styles.badgeImage} />
      <Text style={styles.title}>Verification Badge Payment</Text>
      {user?.verified && badgeExpiry ? (
        <View style={{ alignItems: 'center', marginVertical: 18 }}>
          <Text style={styles.amountLabel}>Your badge is active!</Text>
          <Text style={styles.amountLabel}>Valid through:</Text>
          <Text style={styles.amountValue}>{new Date(badgeExpiry).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          <TouchableOpacity style={[styles.payBtn, { opacity: 0.6 }]} disabled={true}>
            <Text style={styles.payBtnText}>Valid through: {new Date(badgeExpiry).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>Choose your payment method:</Text>
          <View style={styles.optionsCol}>
            {PAYMENT_OPTIONS.map((opt, idx) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.optionBtn, idx > 0 && { marginTop: 16 }]}
                onPress={() => handleOptionPress(opt.key)}
                disabled={loading}
              >
                <View style={styles.logoRow}>
                  <Image source={{ uri: opt.logo }} style={styles.logoImg} />
                  <Text style={styles.optionText}>{opt.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
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
