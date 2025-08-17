import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app_theme';

export default function ThemeToggleScreen({ navigation }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    (async () => {
      const storedTheme = await AsyncStorage.getItem(THEME_KEY);
      setIsDark(storedTheme === 'dark');
    })();
  }, []);

  const handleToggle = async (value) => {
    setIsDark(value);
    await AsyncStorage.setItem(THEME_KEY, value ? 'dark' : 'light');
    Alert.alert('Theme Changed', `Theme set to ${value ? 'Dark' : 'Light'}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Theme</Text>
      <Text style={styles.subtitle}>Switch between light and dark mode:</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
          value={isDark}
          onValueChange={handleToggle}
        />
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.saveText}>Back</Text>
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
