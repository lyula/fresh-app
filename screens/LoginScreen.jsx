
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styled } from 'dripsy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const PRIMARY = '#a99d6b';
const PRIMARY_BLUE = '#1E3A8A';

const Container = styled(SafeAreaView)({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 16,
  backgroundColor: '#f8fafc',
});

const Input = styled(TextInput)({
  width: '100%',
  borderWidth: 1,
  borderColor: PRIMARY,
  borderRadius: 8,
  padding: 12,
  marginBottom: 16,
  fontSize: 16,
  backgroundColor: '#f9fafb',
  color: '#222',
});

const Button = styled(TouchableOpacity)({
  width: '100%',
  backgroundColor: PRIMARY,
  paddingVertical: 14,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: 8,
});

const API_BASE = process.env.API_BASE_URL || 'http://192.168.100.37:5000/api';
console.log('[DEBUG] API_BASE resolved to:', API_BASE);

async function loginUser({ email, password }) {
  try {
    console.log('[Login] Sending request to:', `${API_BASE}/auth/login`);
    console.log('[Login] Payload:', { email, password });
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    console.log('[Login] Response status:', res.status);
    const text = await res.text();
    console.log('[Login] Response text:', text);
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      console.error('[Login] Failed to parse response JSON:', parseErr);
      throw new Error("Server error: " + text);
    }
  } catch (err) {
    console.error('[Login] Network or fetch error:', err);
    throw err;
  }
}

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      console.log('[Login] Attempting login for:', email);
      const result = await loginUser({ email, password });
      setLoading(false);
      console.log('[Login] Result:', result);
      if (result.token) {
        await AsyncStorage.setItem('token', result.token);
  navigation.replace('PostsFeed');
      } else {
        setError(result.message || 'Login failed.');
        console.warn('[Login] Login failed:', result);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed.');
      console.error('[Login] Error during login:', err);
    }
  };

  return (
    <Container>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: PRIMARY_BLUE, marginBottom: 24, textAlign: 'center' }}>
        Welcome Back
      </Text>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#b3b3b3"
      />
      <View style={{ width: '100%', position: 'relative' }}>
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#b3b3b3"
          style={{ marginBottom: 0 }}
        />
        <TouchableOpacity
          style={styles.showHide}
          onPress={() => setShowPassword((v) => !v)}
        >
          <Text style={{ color: PRIMARY, fontWeight: 'bold' }}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      {error ? (
        <Text style={{ color: 'red', marginBottom: 8, marginTop: 8, textAlign: 'center' }}>{error}</Text>
      ) : null}
      <Button onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" style={{ marginVertical: 2 }} />
        ) : (
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Login</Text>
        )}
      </Button>
      <Text style={{ marginTop: 24, color: '#666', textAlign: 'center' }}>
        Don't have an account?{' '}
        <Text style={{ color: PRIMARY_BLUE, fontWeight: 'bold' }} onPress={() => navigation.navigate('Register')}>
          Register
        </Text>
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  showHide: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 2,
  },
});
