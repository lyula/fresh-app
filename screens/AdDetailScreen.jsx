import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function AdDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { ad } = route.params || {};

  if (!ad) {
    return (
      <View style={styles.centered}><Text>No ad details found.</Text></View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.card}>
        <Text style={styles.title}>{ad.title}</Text>
        <Text style={styles.label}>Status: <Text style={styles.value}>{ad.status}</Text></Text>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{ad.description}</Text>
        {ad.linkUrl && (
          <Text style={styles.label}>Link: <Text style={styles.value}>{ad.linkUrl}</Text></Text>
        )}
        {ad.duration && (
          <Text style={styles.label}>Duration: <Text style={styles.value}>{ad.duration} days</Text></Text>
        )}
        {ad.pricing?.totalPriceUSD && (
          <Text style={styles.label}>Price: <Text style={styles.value}>${ad.pricing.totalPriceUSD}</Text></Text>
        )}
        {ad.schedule?.startDate && (
          <Text style={styles.label}>Start: <Text style={styles.value}>{new Date(ad.schedule.startDate).toLocaleDateString()}</Text></Text>
        )}
        {ad.schedule?.endDate && (
          <Text style={styles.label}>End: <Text style={styles.value}>{new Date(ad.schedule.endDate).toLocaleDateString()}</Text></Text>
        )}
        {ad.targetingType && (
          <Text style={styles.label}>Targeting: <Text style={styles.value}>{ad.targetingType === 'global' ? 'Global' : `${ad.targetCountries?.length || 0} Countries`}</Text></Text>
        )}
        {ad.category && (
          <Text style={styles.label}>Category: <Text style={styles.value}>{ad.category}</Text></Text>
        )}
        {/* Add more details as needed */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f7f8fa', padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  backButton: { alignSelf: 'flex-start', marginBottom: 12, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e3e7ed' },
  backText: { fontSize: 16, color: '#2d6cdf', fontWeight: 'bold' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 18, textAlign: 'center' },
  label: { fontSize: 15, color: '#555', fontWeight: '500', marginTop: 8 },
  value: { fontSize: 15, color: '#222', fontWeight: '400' },
});
