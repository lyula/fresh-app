import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.item}>
          <MaterialCommunityIcons name="account-edit" size={22} color="#4F8EF7" style={styles.icon} />
          <Text style={styles.itemText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <MaterialCommunityIcons name="lock-reset" size={22} color="#4F8EF7" style={styles.icon} />
          <Text style={styles.itemText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <MaterialCommunityIcons name="badge-account" size={22} color="#4F8EF7" style={styles.icon} />
          <Text style={styles.itemText}>Verified Badge</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity style={styles.item}>
          <MaterialCommunityIcons name="bell" size={22} color="#4F8EF7" style={styles.icon} />
          <Text style={styles.itemText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <MaterialCommunityIcons name="palette" size={22} color="#4F8EF7" style={styles.icon} />
          <Text style={styles.itemText}>Theme</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.item}>
          <MaterialCommunityIcons name="help-circle" size={22} color="#4F8EF7" style={styles.icon} />
          <Text style={styles.itemText}>Help Center</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <MaterialCommunityIcons name="email" size={22} color="#4F8EF7" style={styles.icon} />
          <Text style={styles.itemText}>Contact Us</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.item, styles.logout]}>
          <MaterialCommunityIcons name="logout" size={22} color="#e74c3c" style={styles.icon} />
          <Text style={[styles.itemText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginTop: 8, marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, elevation: 1 },
  icon: { marginRight: 12 },
  itemText: { fontSize: 16, color: '#222' },
  logout: { backgroundColor: '#ffeaea' },
  logoutText: { color: '#e74c3c', fontWeight: 'bold' },
});
