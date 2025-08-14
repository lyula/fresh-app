
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/user';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PAYMENTS_CACHE_KEY = 'fxsnip_payments_cache';
const PAYMENTS_CACHE_TIME_KEY = 'fxsnip_payments_cache_time';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function PaymentsScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const API_BASE = Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL;

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No token found');
        const headers = { Authorization: `Bearer ${token}` };
        // Fetch both badge and journal payments
        const [badgeRes, journalRes] = await Promise.all([
          fetch(`${API_BASE}/badge-payments/my`, { headers }),
          fetch(`${API_BASE}/journal-payments`, { headers })
        ]);
        let badgePayments = badgeRes.ok ? await badgeRes.json() : [];
        let journalPayments = journalRes.ok ? await journalRes.json() : [];
        if (!Array.isArray(badgePayments)) badgePayments = badgePayments ? [badgePayments] : [];
        if (!Array.isArray(journalPayments)) journalPayments = journalPayments ? [journalPayments] : [];
        badgePayments = badgePayments.map(p => ({ ...p, _paymentType: 'Badge' }));
        journalPayments = journalPayments.map(p => ({ ...p, _paymentType: 'Journal' }));
        const allPayments = [...badgePayments, ...journalPayments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPayments(allPayments);
      } catch (err) {
        setError(err?.message || 'Failed to fetch payments');
        console.error('Payments fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, [user]);

  const totalPages = Math.ceil(payments.length / recordsPerPage);
  const paginatedPayments = payments.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const renderPayment = ({ item, index }) => {
    const isSuccess = item.status === 'success' || item.status === 'completed';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (item._paymentType === 'Journal') {
            navigation.navigate('JournalPaymentDetail', { paymentId: item._id || item.id || index });
          } else {
            navigation.navigate('BadgePaymentDetail', { paymentId: item._id || item.id || index });
          }
        }}
      >
        <View style={styles.row}><Text style={styles.label}>Amount:</Text><Text style={[styles.amount, isSuccess ? styles.success : styles.failed]}>{item.currency || 'KES'} {typeof item.amount === 'number' ? item.amount.toLocaleString() : item.amount}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Date:</Text><Text style={styles.date}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Type:</Text><Text style={styles.type}>{item._paymentType || 'Payment'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Status:</Text><Text style={[styles.status, isSuccess ? styles.success : styles.failed]}>{item.status}</Text></View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#a99d6b" style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : payments.length === 0 ? (
        <Text style={styles.empty}>No payments found.</Text>
      ) : (
        <>
          <FlatList
            data={paginatedPayments}
            keyExtractor={(item, idx) => String(item._id || item.id || idx)}
            renderItem={renderPayment}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageBtn, currentPage === 1 && styles.disabled]}
              onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <Text style={styles.pageBtnText}>Previous</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>Page {currentPage} of {totalPages}</Text>
            <TouchableOpacity
              style={[styles.pageBtn, currentPage === totalPages && styles.disabled]}
              onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <Text style={styles.pageBtnText}>Next</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 18,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
    color: '#444',
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#888',
  },
  type: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  status: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  success: {
    color: '#22c55e',
  },
  failed: {
    color: '#ef4444',
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 12,
  },
  pageBtn: {
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pageBtnText: {
    color: '#222',
    fontWeight: 'bold',
  },
  pageInfo: {
    color: '#444',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
