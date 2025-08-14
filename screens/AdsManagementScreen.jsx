import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AdCard from '../components/AdCard';
import { getUserAds } from '../utils/adInteractionsApi';

export default function AdsManagementScreen() {
  const navigation = useNavigation();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    setLoading(true);
    setError('');
    try {
      const result = await getUserAds();
  // Removed noisy console.log
      setAds(result || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch ads');
  // Removed noisy console.log
    } finally {
      setLoading(false);
    }
  }

  const filteredAds = ads.filter(ad => {
    const matchesFilter = filter === 'all' || ad.status === filter;
    const matchesSearch = ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) || ad.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = ads.reduce((acc, ad) => {
    acc[ad.status] = (acc[ad.status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {});

  const statusList = ['all', 'active', 'paused', 'pending_approval', 'pending_payment', 'draft', 'completed', 'rejected'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Ad Management</Text>
      <Text style={styles.subHeader}>Manage your advertisements and track their performance</Text>
      {/* Stats Overview */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statLabel}>Total Ads</Text><Text style={styles.statValue}>{ads.length}</Text></View>
        <View style={styles.statCard}><Text style={styles.statLabel}>Active</Text><Text style={styles.statValue}>{statusCounts.active || 0}</Text></View>
        <View style={styles.statCard}><Text style={styles.statLabel}>Pending</Text><Text style={styles.statValue}>{(statusCounts.pending_approval || 0) + (statusCounts.pending_payment || 0)}</Text></View>
        <View style={styles.statCard}><Text style={styles.statLabel}>Completed</Text><Text style={styles.statValue}>{statusCounts.completed || 0}</Text></View>
      </View>
      {/* Filters and Search */}
      <View style={styles.filterGridWrap}>
        {/* All filters, three per row */}
        <View style={styles.threePerRowGridWrap}>
          {(() => {
            const allFilters = statusList;
            const rows = [];
            for (let i = 0; i < allFilters.length; i += 3) {
              rows.push(
                <View key={i} style={styles.threePerRowGridRow}>
                  {[allFilters[i], allFilters[i+1], allFilters[i+2]].filter(Boolean).map(status => (
                    <View key={status} style={styles.threePerRowGridItem}>
                      <TouchableOpacity style={[styles.filterBtn, filter === status && styles.filterBtnActive]} onPress={() => setFilter(status)}>
                        <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>{status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} {statusCounts[status] ? `(${statusCounts[status]})` : ''}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              );
            }
            return rows;
          })()}
        </View>
        <View style={styles.searchBox}><Text>🔍</Text><TextInput style={styles.searchInput} placeholder="Search ads..." value={searchTerm} onChangeText={setSearchTerm} /></View>
      </View>
      {/* Ads Grid */}
      {error ? (
        <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
      ) : loading ? (
        <ActivityIndicator size="large" color="#a99d6b" style={{ marginTop: 40 }} />
      ) : filteredAds.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>👁️</Text>
          <Text style={styles.emptyTitle}>{searchTerm || filter !== 'all' ? 'No ads found' : 'No ads created yet'}</Text>
          <Text style={styles.emptyDesc}>{searchTerm || filter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Create your first advertisement to get started.'}</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredAds.map(ad => (
            <AdCard key={ad._id} ad={ad} onView={() => {}} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  threePerRowGridWrap: { width: '100%', marginBottom: 10 },
  threePerRowGridRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  threePerRowGridItem: { flex: 1, marginHorizontal: 4, alignItems: 'center' },
  twoWordGridWrap: { width: '100%', marginBottom: 10 },
  twoWordGridRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  twoWordGridItem: { flex: 1, marginHorizontal: 4, alignItems: 'center' },
  container: { padding: 16, backgroundColor: '#f7f8fa', flexGrow: 1 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 4, textAlign: 'center' },
  subHeader: { fontSize: 15, color: '#555', marginBottom: 18, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', flex: 1, marginHorizontal: 4, elevation: 2 },
  statLabel: { fontSize: 13, color: '#888' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  filterGridWrap: { flexDirection: 'column', marginBottom: 16, width: '100%' },
  filterGridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  filterGridItem: { flexBasis: '23%', marginBottom: 10, alignItems: 'center' },
  filterBtn: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#e3e7ed', width: '100%' },
  filterBtnActive: { backgroundColor: '#a99d6b' },
  filterText: { color: '#555', fontSize: 15, textAlign: 'center', flexWrap: 'nowrap' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 10, marginLeft: 8, flex: 1, minWidth: 120 },
  searchInput: { flex: 1, paddingVertical: 6, paddingHorizontal: 8, fontSize: 15, color: '#222' },
  errorBox: { backgroundColor: '#ffeaea', borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: '#e74c3c', fontSize: 15 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 36, color: '#bbb', marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  emptyDesc: { fontSize: 14, color: '#888', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
