import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import StoriesBar from '../components/StoriesBar';
import SearchUser from '../components/SearchUser';
import MainHeader from '../components/MainHeader';
import { useNavigation } from '@react-navigation/native';
import { getConversations, getProfileImages } from '../utils/api';

const messages = [
  { id: '1', user: 'Alice', lastMessage: 'Hey, how are you?', time: '2m ago' },
  { id: '2', user: 'Bob', lastMessage: 'Let’s catch up soon!', time: '10m ago' },
  { id: '3', user: 'Charlie', lastMessage: 'Sent the files.', time: '1h ago' },
  // ...more sample messages
];


export default function MessagesScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [profileImages, setProfileImages] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getConversations()
      .then(async data => {
        if (!mounted) return;
        let convs = Array.isArray(data) ? data : data.conversations || [];
        setConversations(convs);
        // Fetch profile images for all users in conversations
        const userIds = convs.map(c => c._id || (c.user && c.user._id)).filter(Boolean);
        if (userIds.length) {
          try {
            const res = await getProfileImages({ userIds });
            if (res && res.images) setProfileImages(res.images);
            else setProfileImages({});
          } catch {
            setProfileImages({});
          }
        } else {
          setProfileImages({});
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load messages');
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const renderItem = ({ item }) => {
    // Defensive: Only render strings/numbers in Text
    const userId = item._id || (item.user && item.user._id);
    const username = typeof item.username === 'string'
      ? item.username
      : (item.user && typeof item.user.username === 'string' ? item.user.username : 'User');
    // Avatar logic: use fetched image, else DiceBear fallback
    const avatarUri = profileImages[userId]
      || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`;
    // Last message logic: prefer item.lastMessage, then item.text, then [media]
    let lastMessage = '';
    if (typeof item.lastMessage === 'string') lastMessage = item.lastMessage;
    else if (typeof item.text === 'string') lastMessage = item.text;
    else if (item.mediaUrl) lastMessage = '[media]';
    else lastMessage = '';
    // Time logic: prefer item.lastTime, then item.time, then item.createdAt
    let time = '';
    if (typeof item.lastTime === 'string') time = item.lastTime;
    else if (typeof item.time === 'string') time = item.time;
    else if (item.createdAt) {
      // Format ISO date to short time
      const d = new Date(item.createdAt);
      time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return (
      <TouchableOpacity style={styles.messageRow} activeOpacity={0.85}>
        <View style={styles.avatarShadow}>
          <View style={styles.avatarPlaceholder}>
            {/* Avatar image (React Native Image) */}
            <Image
              source={{ uri: avatarUri }}
              style={{ width: 44, height: 44, borderRadius: 22, position: 'absolute' }}
              resizeMode="cover"
              defaultSource={require('../assets/blue-badge.png')}
            />
          </View>
        </View>
        <View style={styles.messageContent}>
          <Text style={styles.user}>{username}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>{lastMessage}</Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
        <MainHeader
          title="Messages"
          onCommunity={() => navigation.navigate('PostsFeed')}
          onMessages={() => navigation.navigate('MessagesScreen')}
          onNotifications={() => navigation.navigate('NotificationsScreen')}
          onProfile={() => navigation.navigate('PublicProfileScreen')}
        />
      </View>
      {/* Stories feature */}
      <View style={{ marginTop: 56 }}>
        <StoriesBar />
      </View>
      {/* Search user feature */}
      <SearchUser onUserSelect={(user) => { /* handle user selection if needed */ }} />
      {/* Divider between search input and messages */}
      <View style={{ height: 1, backgroundColor: '#ececec', marginVertical: 4, borderRadius: 1 }} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1E3A8A" />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item._id || item.id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 12 }}
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 2,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  avatarShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    borderRadius: 24,
    marginRight: 14,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
  },
  messageContent: {
    flex: 1,
    flexDirection: 'column',
  },
  user: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1E3A8A',
  },
  lastMessage: {
    color: '#555',
    fontSize: 14,
    marginTop: 2,
  },
  time: {
    color: '#888',
    fontSize: 12,
    marginLeft: 10,
  },
});
