import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';
import { useUser } from '../context/user';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { updateProfile as updateProfileApi, uploadToCloudinary } from '../utils/user';

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
    setMessage('');
    try {
      // Validate username
      if (!form.username || form.username.length < 3 || form.username.length > 30 || /\s/.test(form.username)) {
        setMessage('Invalid username. Use 3-30 characters, no spaces.');
        setLoading(false);
        return;
      }
      let profileImageUrl = form.profileImage;
      // If profileImage is a local file, upload to Cloudinary
      if (profileImageUrl && profileImageUrl.startsWith('file')) {
        setMessage('Uploading image...');
        try {
          const uploadRes = await uploadToCloudinary(profileImageUrl);
          profileImageUrl = uploadRes.secure_url;
        } catch (err) {
          setMessage('Image upload failed.');
          setLoading(false);
          return;
        }
      }
      // Prepare profile object
      const profileObj = {
        bio: form.bio,
        website: form.website,
        location: form.location,
        profileImage: profileImageUrl,
      };
      // Call API
      const res = await updateProfileApi({
        username: form.username,
        email: form.email,
        profile: profileObj,
      });
      if (res && res.username) {
        setMessage('Profile updated successfully!');
        // Force refresh user context so all components get the latest image
        try {
          const { getProfile } = require('../utils/user');
          const freshProfile = await getProfile();
          setUser(freshProfile);
        } catch (err) {
          console.warn('Failed to refresh profile after update:', err);
        }
        setTimeout(() => setMessage(''), 2000);
        navigation.goBack();
      } else {
        setMessage(res.message || 'Update failed.');
      }
    } catch (err) {
      setMessage('Failed to update profile.');
    }
    setLoading(false);
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
        <TouchableOpacity style={styles.changePhotoBtn} onPress={async () => {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setForm({ ...form, profileImage: result.assets[0].uri });
          }
        }}>
          <Text style={styles.changePhotoText}>Change Profile Picture</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.inputLabel}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={form.username}
        onChangeText={text => handleChange('username', text)}
      />
      <Text style={styles.inputLabel}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={text => handleChange('email', text)}
      />
      <Text style={styles.inputLabel}>Bio</Text>
      <TextInput
        style={styles.input}
        placeholder="Bio"
        value={form.bio}
        onChangeText={text => handleChange('bio', text)}
      />
      <Text style={styles.inputLabel}>Website</Text>
      <TextInput
        style={styles.input}
        placeholder="Website"
        value={form.website}
        onChangeText={text => handleChange('website', text)}
      />
      <Text style={styles.inputLabel}>Location</Text>
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
  inputLabel: { fontSize: 15, color: '#222', marginBottom: 4, marginLeft: 2, fontWeight: '500' },
  readOnlyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  readOnlyLabel: { fontSize: 16, color: '#555', marginRight: 8 },
  readOnlyValue: { fontSize: 16, color: '#222', fontWeight: 'bold' },
});
