import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getNotificationPreferences, saveNotificationPreferences } from '../utils/notifications';

export default function NotificationPreferencesScreen({ navigation }) {
  const [preferences, setPreferences] = useState({
    push: true,
    email: false,
    sms: false,
    pushTypes: {
      comment: true,
      reply: true,
      like: true,
      mention: true,
      message: true,
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPrefs() {
      try {
        const prefs = await getNotificationPreferences();
        setPreferences({
          ...prefs,
          pushTypes: {
            comment: prefs?.pushTypes?.comment ?? true,
            reply: prefs?.pushTypes?.reply ?? true,
            like: prefs?.pushTypes?.like ?? true,
            mention: prefs?.pushTypes?.mention ?? true,
            message: prefs?.pushTypes?.message ?? true,
          },
        });
      } catch {
        // fallback to defaults
      }
    }
    fetchPrefs();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveNotificationPreferences(preferences);
      Alert.alert('Saved', 'Your notification preferences have been updated.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Preferences</Text>
      <Text style={styles.subtitle}>Choose how you want to be notified:</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Push Notifications</Text>
        <Switch
          value={preferences.push}
          onValueChange={v => setPreferences(p => ({ ...p, push: v }))}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Email Notifications</Text>
        <Switch
          value={preferences.email}
          onValueChange={v => setPreferences(p => ({ ...p, email: v }))}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>SMS Notifications</Text>
        <Switch
          value={preferences.sms}
          onValueChange={v => setPreferences(p => ({ ...p, sms: v }))}
        />
      </View>
      <View style={styles.divider} />
      <Text style={styles.subtitle}>Push Notification Types:</Text>
      {Object.entries(preferences.pushTypes).map(([type, value]) => (
        <View style={styles.row} key={type}>
          <Text style={styles.label}>{type.charAt(0).toUpperCase() + type.slice(1)} Notifications</Text>
          <Switch
            value={value}
            onValueChange={v => setPreferences(p => ({
              ...p,
              pushTypes: { ...p.pushTypes, [type]: v }
            }))}
          />
        </View>
      ))}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save Preferences'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#222' },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  label: { fontSize: 16, color: '#222' },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    backgroundColor: '#f7f8fa',
  },
  saveBtn: { backgroundColor: '#1E3A8A', borderRadius: 8, padding: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
