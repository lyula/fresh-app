import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import StoriesBar from '../components/StoriesBar';
import SearchUser from '../components/SearchUser';
import MainHeader from '../components/MainHeader';
import { useNavigation } from '@react-navigation/native';
import { getConversations, getProfileImages } from '../utils/api';
// Use the same badge as in posts
import { Image as RNImage } from 'react-native';

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
    // Truncate message preview (like web)
    const truncateMessage = (text, maxLength = 50) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };
    // Last message logic: extract from lastMessage object if present (like web)
    let lastMessage = '';
    if (item.lastMessage && typeof item.lastMessage === 'object') {
      if (typeof item.lastMessage.text === 'string' && item.lastMessage.text.trim()) {
        lastMessage = item.lastMessage.text;
      } else if (item.lastMessage.mediaUrl) {
        lastMessage = '[media]';
      }
    } else if (typeof item.lastMessage === 'string' && item.lastMessage.trim()) {
      lastMessage = item.lastMessage;
    } else if (typeof item.text === 'string' && item.text.trim()) {
      lastMessage = item.text;
    } else if (item.mediaUrl) {
      lastMessage = '[media]';
    } else {
      lastMessage = '';
    }
    lastMessage = truncateMessage(lastMessage, 50);

    // Time logic: extract from lastMessage.createdAt if present (like web)
    let time = '';
    if (item.lastMessage && typeof item.lastMessage === 'object' && item.lastMessage.createdAt) {
      const d = new Date(item.lastMessage.createdAt);
      // Show relative time (e.g., '2m ago') if desired, else fallback to time string
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) time = 'now';
      else if (diffMins < 60) time = `${diffMins}m ago`;
      else if (diffMins < 1440) time = `${Math.floor(diffMins / 60)}h ago`;
      else time = d.toLocaleDateString();
    } else if (typeof item.lastTime === 'string' && item.lastTime.trim()) {
      time = item.lastTime;
    } else if (item.updatedAt) {
      const d = new Date(item.updatedAt);
      time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (item.createdAt) {
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.user}>{username}</Text>
            {item.verified && (
              <RNImage
                source={require('../assets/blue-badge.png')}
                style={{ width: 18, height: 18, marginLeft: 4, marginTop: 2 }}
                resizeMode="contain"
                accessibilityLabel="Verified badge"
              />
            )}
          </View>
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
