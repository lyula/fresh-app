import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getBadgePayments, getJournalPayments } from '../utils/api';

export default function PaymentsDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [isJournal, setIsJournal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPayment() {
      setLoading(true);
      setError(null);
      try {
        // Use robust payment fetching functions
        const [badgePayments, journalPayments] = await Promise.all([
          getBadgePayments(),
          getJournalPayments()
        ]);
        const allPayments = [...(badgePayments || []), ...(journalPayments || [])];
        const found = allPayments.find(
          p => (p._id || p.id) === paymentId || String(p._id || p.id) === String(paymentId)
        );
        setPayment(found || null);
        setIsJournal(!!journalPayments.find(
          p => (p._id || p.id) === paymentId || String(p._id || p.id) === String(paymentId)
        ));
      } catch (err) {
        setError('Failed to fetch payment details.');
      } finally {
        setLoading(false);
      }
    }
    fetchPayment();
  }, [paymentId]);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={[styles.card, { opacity: 0.5 }]}> 
          <Text style={styles.title}>Payment Details</Text>
          <View style={styles.detailRow}><Text style={[styles.label, styles.skeleton]}>M-Pesa Code:</Text><Text style={[styles.value, styles.skeleton]}>----</Text></View>
          <View style={styles.detailRow}><Text style={[styles.label, styles.skeleton]}>Amount:</Text><Text style={[styles.value, styles.skeleton]}>----</Text></View>
          <View style={styles.detailRow}><Text style={[styles.label, styles.skeleton]}>Date:</Text><Text style={[styles.value, styles.skeleton]}>----</Text></View>
          <View style={styles.detailRow}><Text style={[styles.label, styles.skeleton]}>Reason:</Text><Text style={[styles.value, styles.skeleton]}>----</Text></View>
          <View style={styles.detailRow}><Text style={[styles.label, styles.skeleton]}>Status:</Text><Text style={[styles.value, styles.skeleton]}>----</Text></View>
          <View style={styles.detailRow}><Text style={[styles.label, styles.skeleton]}>Phone Number:</Text><Text style={[styles.value, styles.skeleton]}>----</Text></View>
          <View style={styles.detailRow}><Text style={[styles.label, styles.skeleton]}>Reference:</Text><Text style={[styles.value, styles.skeleton]}>----</Text></View>
        </View>
      </ScrollView>
    );
  }
  if (error) {
    return (
      <View style={styles.centered}><Text>{error}</Text></View>
    );
  }
  if (!payment) {
    return (
      <View style={styles.centered}><Text>Payment not found.</Text></View>
    );
  }

  const isSuccess = payment.status === 'success' || payment.status === 'completed';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.card}>
        <Text style={styles.title}>{isJournal ? 'Journal Payment Details' : 'Payment Details'}</Text>
        <View style={styles.detailRow}><Text style={styles.label}>M-Pesa Code:</Text><Text style={styles.value}>{isJournal ? payment.mpesaCode || payment.code || payment.receipt || payment.rawResponse?.MpesaReceiptNumber || payment.rawResponse?.receipt || '-' : payment.mpesaCode || payment.code || '-'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.label}>Amount:</Text><Text style={[styles.value, isSuccess ? styles.success : styles.fail]}>{isSuccess ? (payment.currency || 'KES') : 'KES'} {typeof payment.amount === 'number' ? payment.amount.toLocaleString() : (Number(payment.amount)?.toLocaleString?.() || payment.amount)}</Text></View>
        <View style={styles.detailRow}><Text style={styles.label}>Date:</Text><Text style={styles.value}>{payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '-'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.label}>Reason:</Text><Text style={styles.value}>{isJournal ? (payment.journalType === 'screenrecording' ? 'Unlimited Journals + Screen Recordings' : payment.journalType === 'unlimited' ? 'Unlimited Journals (No Screen Recordings)' : payment.journalType || '-') : payment.type === 'verified_badge' ? 'Blue Badge subscription' : payment.type ? `${payment.type.charAt(0).toUpperCase() + payment.type.slice(1)} badge subscription` : '-'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.label}>Status:</Text><Text style={[styles.value, styles.status, isSuccess ? styles.success : styles.fail]}>{payment.status}</Text></View>
        {!isSuccess && (
          (() => {
            let failureReason = payment.failureReason
              || payment.rawResponse?.ResultDesc
              || payment.rawResponse?.resultDesc
              || payment.methodDetails?.ResultDesc
              || payment.methodDetails?.resultDesc;
            return <View style={styles.detailRow}><Text style={styles.label}>Reason:</Text><Text style={[styles.value, styles.fail]}>{failureReason ? failureReason : 'Unknown error'}</Text></View>;
          })()
        )}
        <View style={styles.detailRow}><Text style={styles.label}>Phone Number:</Text><Text style={styles.value}>{isJournal ? payment.phone || payment.rawResponse?.Phone || payment.methodDetails?.MpesaReceiptNumber || '-' : payment.rawResponse?.Phone || payment.methodDetails?.MpesaReceiptNumber || '-'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.label}>Reference:</Text><Text style={styles.value}>{isJournal ? payment.rawResponse?.ExternalReference || payment.rawResponse?.external_reference || payment.transactionId || '-' : payment.rawResponse?.ExternalReference || payment.rawResponse?.external_reference || '-'}</Text></View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f7f8fa',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e3e7ed',
  },
  backText: {
    fontSize: 16,
    color: '#2d6cdf',
    fontWeight: 'bold',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  status: {
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'capitalize',
  },
  success: {
    color: '#1bbf4c',
  },
  fail: {
    color: '#e74c3c',
  },
  skeleton: {
    backgroundColor: '#e3e7ed',
    color: '#e3e7ed',
    borderRadius: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});
