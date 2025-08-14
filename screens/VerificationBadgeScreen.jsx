import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/user';
import { getLatestBadgePayment } from '../utils/api';

export default function VerificationBadgeScreen() {
  const navigation = useNavigation();
  const { user, refreshUser } = useUser();
  const [badgeExpiry, setBadgeExpiry] = useState(null);

  useEffect(() => {
    // Always refresh user context and fetch badge expiry on mount
    const fetchBadgeExpiry = async () => {
      await refreshUser();
      try {
        const badge = await getLatestBadgePayment();
        console.log('[Badge Expiry Debug] badge response:', badge);
        console.log('[Badge Expiry Debug] user:', user);
        if (badge?.periodEnd) {
          setBadgeExpiry(badge.periodEnd);
          console.log('[Badge Expiry Debug] periodEnd:', badge.periodEnd);
        } else {
          setBadgeExpiry(null);
          console.log('[Badge Expiry Debug] No periodEnd found');
        }
      } catch (err) {
        setBadgeExpiry(null);
        console.log('[Badge Expiry Debug] Error:', err);
      }
    };
    fetchBadgeExpiry();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/blue-badge.png')} style={styles.badgeImage} />
      <Text style={styles.title}>Get Verified!</Text>
      <Text style={styles.subtitle}>Unlock exclusive benefits with a verification badge:</Text>
      <View style={styles.benefitsList}>
        <Text style={styles.benefit}>• Fewer ads for a cleaner experience</Text>
        <Text style={styles.benefit}>• Wider audience reach for your posts</Text>
        <Text style={styles.benefit}>• Priority support from our team</Text>
        <Text style={styles.benefit}>• Increased profile visibility</Text>
        <Text style={styles.benefit}>• Enhanced trust and credibility</Text>
        <Text style={styles.benefit}>• Early access to new features</Text>
        <Text style={styles.benefit}>• Special badge on your profile</Text>
      </View>
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
        <TouchableOpacity style={styles.payBtn} onPress={() => navigation.navigate('BadgePaymentScreen')}>
          <Text style={styles.payBtnText}>Proceed to Payment</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 32, alignItems: 'center', backgroundColor: '#f7f8fa', flexGrow: 1 },
  badgeImage: { width: 80, height: 80, marginBottom: 18 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#222', marginBottom: 18, textAlign: 'center' },
  benefitsList: { alignItems: 'flex-start', marginBottom: 24 },
  benefit: { fontSize: 16, color: '#222', marginBottom: 8 },
  payBtn: { backgroundColor: '#1e3a8a', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8, width: '100%' },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
