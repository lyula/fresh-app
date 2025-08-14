import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../components/MainHeader';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <MainHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Change Password</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Theme</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Help Center</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Contact Us</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.item, styles.logout]}>
          <Text style={[styles.itemText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginTop: 24, marginBottom: 12 },
  item: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, elevation: 1 },
  itemText: { fontSize: 16, color: '#222' },
  logout: { backgroundColor: '#ffeaea' },
  logoutText: { color: '#e74c3c', fontWeight: 'bold' },
});
