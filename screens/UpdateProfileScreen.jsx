import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useUser } from '../context/user';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function UpdateProfileScreen({ route }) {
  const navigation = useNavigation();
  const { user: profile } = useUser();
  // You can get user data from route.params if passed
  const [form, setForm] = useState({
    username: '',
    email: '',
    bio: '',
    website: '',
    location: '',
    profileImage: '',
    dateJoined: '',
  });
  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || '',
        email: profile.email || '',
        bio: profile.profile?.bio || '',
        website: profile.profile?.website || '',
        location: profile.profile?.location || '',
        profileImage: (profile.profile?.profileImage || profile.profileImage || profile.avatar || ''),
        dateJoined: profile.createdAt || profile.dateJoined || '',
      });
    }
  }, [profile]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    // TODO: Implement API call to update profile
    setTimeout(() => {
      setLoading(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 2000);
      navigation.goBack();
    }, 1200);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
  <Text style={styles.title}>Your Profile</Text>
      <View style={styles.avatarRow}>
        <Image
          source={(() => {
            let profileImage = null;
            if (form.profileImage) {
              profileImage = form.profileImage;
            } else if (profile) {
              if (profile.profile && (profile.profile.profileImage || profile.profile.avatar)) {
                profileImage = profile.profile.profileImage || profile.profile.avatar;
              } else if (profile.profileImage || profile.avatar) {
                profileImage = profile.profileImage || profile.avatar;
              }
            }
            return profileImage ? { uri: profileImage } : { uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' };
          })()}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.changePhotoBtn}>
          <Text style={styles.changePhotoText}>Change Profile Picture</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={form.username}
        onChangeText={text => handleChange('username', text)}
      />
      <View style={styles.readOnlyRow}>
        <Text style={styles.readOnlyLabel}>Date Joined:</Text>
        <Text style={styles.readOnlyValue}>{form.dateJoined ? moment(form.dateJoined).format('MMMM D, YYYY') : 'N/A'}</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={text => handleChange('email', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Bio"
        value={form.bio}
        onChangeText={text => handleChange('bio', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Website"
        value={form.website}
        onChangeText={text => handleChange('website', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={form.location}
        onChangeText={text => handleChange('location', text)}
      />
      <View style={styles.readOnlyRow}>
        <Text style={styles.readOnlyLabel}>Date Joined:</Text>
        <Text style={styles.readOnlyValue}>{form.dateJoined ? moment(form.dateJoined).format('MMMM D, YYYY') : 'N/A'}</Text>
      </View>
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
      {!!message && <Text style={styles.message}>{message}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#f7f8fa', flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 18, color: '#222' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#eee' },
  changePhotoBtn: { marginLeft: 16, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#e0e7ff', borderRadius: 8 },
  changePhotoText: { color: '#1e3a8a', fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 14, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  saveBtn: { backgroundColor: '#1e3a8a', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  message: { color: '#16a34a', marginTop: 16, textAlign: 'center', fontWeight: 'bold' },
  readOnlyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  readOnlyLabel: { fontSize: 16, color: '#555', marginRight: 8 },
  readOnlyValue: { fontSize: 16, color: '#222', fontWeight: 'bold' },
});
