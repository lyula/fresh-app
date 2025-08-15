import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import MainHeader from '../components/MainHeader';
import PostCard from '../components/PostCard';
import BottomHeader from '../components/BottomHeader';
import { useUser } from '../context/user';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PublicProfileScreen({ route }) {
  const scrollRef = React.useRef(null);
  const [showBottomHeader, setShowBottomHeader] = useState(false);

  // Height after which to show the bottom header (profile info height)
  const PROFILE_INFO_HEIGHT = 320; // Adjust as needed for your layout
  const { user: currentUser } = useUser();
  const navigation = useNavigation();
  const routeUsername = route?.params?.username;
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Posts');
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // API base URL
  const API_BASE = Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL;

  // Fetch posts for this user after profile loads
  useEffect(() => {
    if (!profile || !profile._id) return;
    let isMounted = true;
    setLoadingPosts(true);
    fetch(`${API_BASE}/posts/by-userid/${profile._id}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => { if (isMounted) setPosts(Array.isArray(data) ? data : []); })
      .catch(() => { if (isMounted) setPosts([]); })
      .finally(() => { if (isMounted) setLoadingPosts(false); });
    return () => { isMounted = false; };
  }, [profile?._id]);

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
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
          <MainHeader
            title={usernameToShow}
            onCommunity={() => navigation.navigate('PostsFeed')}
            onMessages={() => navigation.navigate('MessagesScreen')}
            onNotifications={() => navigation.navigate('NotificationsScreen')}
            onProfile={() => navigation.navigate('PublicProfileScreen', { username: currentUser?.username })}
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
          <MainHeader
            title={usernameToShow}
            onCommunity={() => navigation.navigate('PostsFeed')}
            onMessages={() => navigation.navigate('MessagesScreen')}
            onNotifications={() => navigation.navigate('NotificationsScreen')}
            onProfile={() => navigation.navigate('PublicProfileScreen', { username: currentUser?.username })}
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#888' }}>User not found.</Text>
        </View>
      </View>
    );
  }

  const profileImage = profile.profileImage || profile.avatar || (profile.profile && (profile.profile.profileImage || profile.profile.avatar)) || null;
  const username = profile.username || profile.name || 'User';
  // Fix bio extraction: always use profile.bio if present, else fallback to profile.profile.bio, else empty string
  let bio = '';
  if (typeof profile.bio === 'string' && profile.bio.trim() !== '') {
    bio = profile.bio;
  } else if (profile.profile && typeof profile.profile.bio === 'string' && profile.profile.bio.trim() !== '') {
    bio = profile.profile.bio;
  }
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
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 80, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
        onScroll={e => {
          const y = e.nativeEvent.contentOffset.y;
          setShowBottomHeader(y > PROFILE_INFO_HEIGHT);
        }}
        scrollEventThrottle={16}
      >
        {/* Profile Image Centered */}
        {profileImage && (
          <Image
            source={{ uri: profileImage }}
            style={{

              width: 90,
              height: 90,
              borderRadius: 45,
              marginTop: 18,
              marginBottom: 8,
              backgroundColor: '#e5e7eb',
              alignSelf: 'center',
            }}
          />
        )}
        {/* Followers/Following Row Centered Below Image */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '70%',
            marginTop: 8,
            marginBottom: 8,
            alignSelf: 'center',
          }}
        >
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#222' }}>{followers.length}</Text>
            <Text style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Followers</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#222' }}>{following.length}</Text>
            <Text style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Following</Text>
          </View>
        </View>
        {/* Bio Section */}
        {bio ? (
          <View style={{ marginTop: 8, alignSelf: 'center', paddingHorizontal: 18, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: 'bold', color: '#222', marginRight: 2, textAlign: 'center', fontSize: 15, lineHeight: 22 }}>Bio :</Text>
            <Text style={[styles.bio, { textAlign: 'center', fontSize: 15, lineHeight: 22, marginBottom: 0 }]}>{bio}</Text>
          </View>
        ) : null}
        {/* Website Section */}
        {website ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(website)}
            style={{ marginTop: 12, marginBottom: 32 }}
          >
            <Text style={styles.website}>{website}</Text>
          </TouchableOpacity>
        ) : null}

        {/* Tabs Row */}
        <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginTop: 10, marginBottom: 10 }}>
          {['Posts', 'Followers', 'Following'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={{
                paddingVertical: 10,
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: activeTab === tab ? '#1E3A8A' : 'transparent',
                flex: 1,
                alignItems: 'center',
              }}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={{ fontWeight: activeTab === tab ? 'bold' : 'normal', color: activeTab === tab ? '#1E3A8A' : '#888', fontSize: 15 }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'Posts' && (
          loadingPosts ? (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 16 }}>Loading posts...</Text>
          ) : posts.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 16 }}>No posts yet.</Text>
          ) : (
            <View style={{ width: '100%' }}>
              {posts
                .filter(post => post.createdAt)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 70)
                .map(post => (
                  <PostCard key={post._id || post.id || post.createdAt} post={post} />
                ))}
            </View>
          )
        )}
        {activeTab === 'Followers' && (
          followers.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 16 }}>No followers yet.</Text>
          ) : (
            <View style={{ width: '100%', alignItems: 'center', marginTop: 8 }}>
              {followers.slice(0, 70).map(follower => (
                <TouchableOpacity
                  key={follower._id || follower.id || follower.username}
                  style={{
                    width: '85%',
                    backgroundColor: '#f3f4f6',
                    borderRadius: 24,
                    paddingVertical: 12,
                    paddingHorizontal: 18,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => navigation.navigate('PublicProfileScreen', { username: follower.username })}
                >
                  <Image
                    source={{ uri: follower.profileImage || follower.avatar || (follower.profile && (follower.profile.profileImage || follower.profile.avatar)) || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                    style={{ width: 38, height: 38, borderRadius: 19, marginRight: 12, backgroundColor: '#e5e7eb' }}
                  />
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1E3A8A' }}>{follower.username}</Text>
                  {follower.verified && (
                    <Image source={require('../assets/blue-badge.png')} style={{ width: 18, height: 18, marginLeft: 6 }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )
        )}
        {activeTab === 'Following' && (
          following.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 16 }}>Not following anyone yet.</Text>
          ) : (
            <View style={{ width: '100%', alignItems: 'center', marginTop: 8 }}>
              {following.slice(0, 70).map(user => (
                <TouchableOpacity
                  key={user._id || user.id || user.username}
                  style={{
                    width: '85%',
                    backgroundColor: '#f3f4f6',
                    borderRadius: 24,
                    paddingVertical: 12,
                    paddingHorizontal: 18,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => navigation.navigate('PublicProfileScreen', { username: user.username })}
                >
                  <Image
                    source={{ uri: user.profileImage || user.avatar || (user.profile && (user.profile.profileImage || user.profile.avatar)) || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                    style={{ width: 38, height: 38, borderRadius: 19, marginRight: 12, backgroundColor: '#e5e7eb' }}
                  />
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1E3A8A' }}>{user.username}</Text>
                  {user.verified && (
                    <Image source={require('../assets/blue-badge.png')} style={{ width: 18, height: 18, marginLeft: 6 }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )
        )}
      </ScrollView>
      {showBottomHeader && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30 }}>
          <BottomHeader
            onHomePress={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({ y: 0, animated: true });
              }
            }}
            onDiscoverPress={() => navigation.navigate('AllProfileSuggestions')}
            onProfilePress={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({ y: 0, animated: true });
              }
            }}
              onSettingsPress={() => navigation.navigate('Settings')}
          />
        </View>
      )}
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '85%',
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 6,
    gap: 14,
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
