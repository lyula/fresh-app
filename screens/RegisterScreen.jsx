// Recreated RegisterScreen to match the original app's UI and logic
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, FlatList, Image } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useNavigation } from '@react-navigation/native';
import { styled } from 'dripsy';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const PRIMARY = '#a99d6b';
const PRIMARY_BLUE = '#1E3A8A';

function CountryAutocomplete({ value, setValue, showList, setShowList }) {
  const [countries, setCountries] = useState([]);
  const [query, setQuery] = useState(value || '');
  const [selectedFlag, setSelectedFlag] = useState(null);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags')
      .then(res => res.json())
      .then(data => {
        const countryList = data.map(c => ({
          name: c.name.common,
          code: c.cca2,
          flag: c.flags && c.flags.png ? c.flags.png : '',
        })).sort((a, b) => a.name.localeCompare(b.name));
        setCountries(countryList);
      });
  }, []);

  useEffect(() => {
    setQuery(value || '');
    const match = countries.find(c => c.name === value);
    setSelectedFlag(match ? match.flag : null);
  }, [value, countries]);

  const filtered = countries.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={{ width: '100%', marginBottom: 16, zIndex: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: PRIMARY, borderRadius: 8, backgroundColor: '#f9fafb', paddingHorizontal: 8, paddingVertical: 6 }}>
        {selectedFlag && filtered.length === 1 && filtered[0].name === query ? (
          <Image source={{ uri: selectedFlag }} style={{ width: 24, height: 16, marginRight: 8, borderRadius: 2 }} />
        ) : null}
        <TextInput
          style={{ flex: 1, fontSize: 16, color: '#222' }}
          placeholder="Type your country"
          value={query}
          onChangeText={text => {
            setQuery(text);
            setValue(text);
            setShowList(true);
          }}
          placeholderTextColor="#b3b3b3"
          autoCapitalize="words"
          onFocus={() => setShowList(true)}
          onBlur={() => setTimeout(() => setShowList(false), 150)}
        />
      </View>
      {showList && (
        <View style={{ position: 'absolute', top: 48, left: 0, right: 0, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ccc', zIndex: 10, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, overflow: 'hidden', height: 220, flex: 1 }}>
          <FlatList
            data={filtered}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                onPress={() => {
                  setValue(item.name);
                  setQuery(item.name);
                  setSelectedFlag(item.flag);
                  setShowList(false);
                }}
              >
                {item.flag && <Image source={{ uri: item.flag }} style={{ width: 24, height: 16, marginRight: 8, borderRadius: 2 }} />}
                <Text style={{ fontSize: 16 }}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ padding: 12, color: '#888' }}>No countries found</Text>}
            keyboardShouldPersistTaps="always"
            style={{ height: 220, flex: 1 }}
          />
        </View>
      )}
    </View>
  );
}

const Container = styled(SafeAreaView)({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingTop: 24,
  paddingBottom: 24,
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

const GenderButton = styled(TouchableOpacity)(({ selected }) => ({
  flex: 1,
  paddingVertical: 12,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: selected ? PRIMARY : '#ccc',
  backgroundColor: selected ? PRIMARY : '#f9fafb',
  alignItems: 'center',
  marginHorizontal: 4,
}));

export default function RegisterScreen() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState(null);
  const [showDate, setShowDate] = useState(false);
  const [country, setCountry] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = () => {
    // TODO: Connect to backend API
    if (!username || !email || !password || !confirm || !gender || !dob || !country) {
      setError('Please fill all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptedTerms) {
      setError('You must accept the Terms and Conditions.');
      return;
    }
    setError('');
  navigation.replace('PostsFeed');
  };

  return (
    <Container>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: PRIMARY_BLUE, marginBottom: 24, textAlign: 'center' }}>
        Create Account
      </Text>
      <Input
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor="#b3b3b3"
        onFocus={() => setShowCountryList(false)}
      />
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#b3b3b3"
        onFocus={() => setShowCountryList(false)}
      />
      <View style={{ width: '100%', marginBottom: 16 }}>
        <View style={{ borderWidth: 1, borderColor: PRIMARY, borderRadius: 8, backgroundColor: '#f9fafb', paddingHorizontal: 8, paddingVertical: 2 }}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={{ width: '100%' }}
            dropdownIconColor={PRIMARY}
            onFocus={() => setShowCountryList(false)}
          >
            <Picker.Item label="Select gender" value="" color="#b3b3b3" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>
      <TouchableOpacity style={styles.dobBtn} onPress={() => { setShowDate(true); setShowCountryList(false); }}>
        <Text style={{ color: dob ? '#222' : '#b3b3b3', fontSize: 16 }}>
          {dob ? dob.toLocaleDateString() : 'Date of Birth'}
        </Text>
      </TouchableOpacity>
      {showDate && (
        <DateTimePicker
          value={dob || new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDate(false);
            if (selectedDate) setDob(selectedDate);
          }}
          maximumDate={new Date()}
        />
      )}
      <CountryAutocomplete
        value={country}
        setValue={setCountry}
        showList={showCountryList}
        setShowList={setShowCountryList}
      />
      <View style={{ width: '100%', position: 'relative', marginBottom: 16 }}>
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#b3b3b3"
          onFocus={() => setShowCountryList(false)}
          style={{ marginBottom: 0 }}
        />
        <TouchableOpacity
          style={styles.showHide}
          onPress={() => setShowPassword((v) => !v)}
        >
          <Text style={{ color: PRIMARY, fontWeight: 'bold' }}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ width: '100%', position: 'relative', marginBottom: 16 }}>
        <Input
          placeholder="Confirm Password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry={!showConfirm}
          placeholderTextColor="#b3b3b3"
          onFocus={() => setShowCountryList(false)}
          style={{ marginBottom: 0 }}
        />
        <TouchableOpacity
          style={styles.showHide}
          onPress={() => setShowConfirm((v) => !v)}
        >
          <Text style={{ color: PRIMARY, fontWeight: 'bold' }}>{showConfirm ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
        <Checkbox
          value={acceptedTerms}
          onValueChange={setAcceptedTerms}
          color={acceptedTerms ? PRIMARY : undefined}
          style={{ marginRight: 8 }}
        />
        <Text style={{ color: '#222', flex: 1, fontSize: 15 }}>
          I accept the{' '}
          <Text
            style={{ color: PRIMARY_BLUE, textDecorationLine: 'underline' }}
            onPress={() => navigation.navigate('Terms')}
          >
            Terms and Conditions
          </Text>
        </Text>
      </View>
      {error ? (
        <Text style={{ color: 'red', marginBottom: 8, marginTop: 8, textAlign: 'center' }}>{error}</Text>
      ) : null}
      <Button onPress={handleRegister}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Register</Text>
      </Button>
      <Text style={{ marginTop: 24, color: '#666', textAlign: 'center' }}>
        Already have an account?{' '}
        <Text style={{ color: PRIMARY_BLUE, fontWeight: 'bold' }} onPress={() => navigation.navigate('Login')}>
          Login
        </Text>
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  dobBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    alignItems: 'flex-start',
  },
  showHide: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 2,
  },
});
