import React from 'react';
import { useUser } from '../context/user';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// ...existing code...

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, logout } = useUser();
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('UpdateProfileScreen')}>
          <MaterialCommunityIcons name="account-edit" size={22} color="#4F8EF7" style={styles.icon} />
          <Text style={styles.itemText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('VerificationBadgeScreen')}>
          <Image source={require('../assets/blue-badge.png')} style={[styles.icon, { width: 22, height: 22 }]} />
          <View style={styles.rowBetween}>
            <Text style={styles.itemText}>Verified Badge</Text>
            {user?.verified ? <Text style={styles.activeText}>Active</Text> : null}
          </View>
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
        <TouchableOpacity style={[styles.item, styles.logout]} onPress={async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
        }}>
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
  rowBetween: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icon: { marginRight: 12 },
  itemText: { fontSize: 16, color: '#222' },
  logout: { backgroundColor: '#ffeaea' },
  activeText: { color: '#22c55e', fontWeight: 'bold', marginLeft: 8 },
  logoutText: { color: '#e74c3c', fontWeight: 'bold' },
});
