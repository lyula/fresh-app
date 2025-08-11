
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView, ActivityIndicator } from 'react-native';
import MainHeader from '../components/MainHeader';
import { useUser } from '../context/user';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PublicProfileScreen({ route }) {
  // If route.params?.username is provided, show that user, else show current user
  const { user: currentUser } = useUser();
  const navigation = useNavigation();
  const routeUsername = route?.params?.username;
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  // API base URL
  const API_BASE =
    (Constants.manifest?.extra?.API_BASE_URL ||
      Constants.expoConfig?.extra?.API_BASE_URL ||
      process.env.API_BASE_URL ||
      'http://192.168.100.37:5000/api');

  // Determine which username to show
  const usernameToShow = routeUsername || currentUser?.username;

  useEffect(() => {
    let isMounted = true;
    async function fetchProfileAndCounts() {
      setLoading(true);
      try {
        // Fetch profile, followers, following in parallel
        const token = await AsyncStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [profileRes, followersRes, followingRes] = await Promise.all([
          fetch(`${API_BASE}/user/public/${encodeURIComponent(usernameToShow)}`, { headers }),
          fetch(`${API_BASE}/user/followers/${encodeURIComponent(usernameToShow)}`),
          fetch(`${API_BASE}/user/following/${encodeURIComponent(usernameToShow)}`, { headers }),
        ]);
        let profileData = null;
        let followersData = [];
        let followingData = [];
        if (profileRes.ok) {
          profileData = await profileRes.json();
        }
        if (followersRes.ok) {
          const result = await followersRes.json();
          followersData = result.followers || [];
        }
        if (followingRes.ok) {
          const result = await followingRes.json();
          followingData = result.following || [];
        }
        if (isMounted) {
          setProfile(profileData);
          setFollowers(followersData);
          setFollowing(followingData);
        }
      } catch (e) {
        if (isMounted) {
          setProfile(null);
          setFollowers([]);
          setFollowing([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (usernameToShow) fetchProfileAndCounts();
    return () => { isMounted = false; };
  }, [usernameToShow]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: '#888' }}>User not found.</Text>
      </View>
    );
  }

  const profileImage = profile.profileImage || profile.avatar || (profile.profile && (profile.profile.profileImage || profile.profile.avatar)) || null;
  const username = profile.username || profile.name || 'User';
  const bio = profile.bio || (profile.profile && profile.profile.bio) || '';
  const website = profile.website || (profile.profile && profile.profile.website) || '';

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
        <MainHeader
          title={username}
          onCommunity={() => navigation.navigate('PostsFeed')}
          onMessages={() => navigation.navigate('MessagesScreen')}
          onNotifications={() => navigation.navigate('NotificationsScreen')}
          onProfile={() => navigation.navigate('PublicProfileScreen', { username: currentUser?.username })}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingTop: 100, paddingBottom: 32, alignItems: 'center' }}>
        {profileImage && (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        )}
        <Text style={styles.username}>@{username}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{followers.length}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{following.length}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
        {bio ? <Text style={styles.bio}>{bio}</Text> : null}
        {website ? (
          <TouchableOpacity onPress={() => Linking.openURL(website)}>
            <Text style={styles.website}>{website}</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#e5e7eb',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statBox: {
    alignItems: 'center',
    marginHorizontal: 18,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
  },
  bio: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  website: {
    fontSize: 15,
    color: '#2563eb',
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
});
