import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView } from 'react-native';
import MainHeader from '../components/MainHeader';
import { useUser } from '../context/user';
import { useNavigation } from '@react-navigation/native';

export default function PublicProfileScreen({ route }) {
  // If route.params?.user is provided, show that user, else show current user
  const { user: currentUser } = useUser();
  const navigation = useNavigation();
  const user = route?.params?.user || currentUser;

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: '#888' }}>No user data available.</Text>
      </View>
    );
  }

  // Extract profile info
  const profile = user.profile || user;
  const profileImage = profile.profileImage || profile.avatar || null;
  const username = profile.username || profile.name || 'User';
  const bio = profile.bio || '';
  const website = profile.website || '';
  const followers = profile.followersCount || profile.followers || 0;
  const following = profile.followingCount || profile.following || 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
        <MainHeader
          title={username}
          onCommunity={() => navigation.navigate('PostsFeed')}
          onMessages={() => navigation.navigate('MessagesScreen')}
          onNotifications={() => navigation.navigate('NotificationsScreen')}
          onProfile={() => navigation.navigate('PublicProfileScreen')}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingTop: 100, paddingBottom: 32, alignItems: 'center' }}>
        {profileImage && (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        )}
        <Text style={styles.username}>@{username}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{following}</Text>
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
