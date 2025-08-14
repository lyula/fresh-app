import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function VerificationBadgeScreen() {
  const navigation = useNavigation();
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
      <TouchableOpacity style={styles.payBtn} onPress={() => navigation.navigate('BadgePaymentScreen')}>
        <Text style={styles.payBtnText}>Proceed to Payment</Text>
      </TouchableOpacity>
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
