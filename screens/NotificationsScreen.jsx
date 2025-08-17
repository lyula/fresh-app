import React, { useEffect, useState, useRef } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import moment from 'moment';
import MainHeader from '../components/MainHeader';
import { getBadgePaymentById, getJournalPaymentById } from '../utils/api';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileImages, setProfileImages] = useState({});
  const fetchingProfiles = useRef({});

  const API_BASE = Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL;

  // Fetch notifications from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchNotifications() {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE}/user/notifications`, { headers });
        if (res.ok) {
          const result = await res.json();
          if (isMounted) setNotifications(result.notifications || result || []);
        } else {
          let errorMsg = `[Notifications] API error: ${res.status} ${res.statusText}`;
          try {
            const errJson = await res.json();
            if (errJson && errJson.message) errorMsg += `\n${errJson.message}`;
          } catch {}
          console.error(errorMsg);
          Alert.alert('Error', errorMsg);
          if (isMounted) setNotifications([]);
        }
      } catch (err) {
        let errorMsg = '[Notifications] Fetch error: ' + (err && err.message ? err.message : err);
        console.error(errorMsg);
        Alert.alert('Error', errorMsg);
        if (isMounted) setNotifications([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchNotifications();
    return () => { isMounted = false; };
  }, []);

  // Fetch missing profile images for notifications with usernames
  useEffect(() => {
    const usernamesToFetch = notifications
      .map(n => n.from?.username || n.username)
      .filter(username => username && !profileImages[username] && !fetchingProfiles.current[username]);
    if (usernamesToFetch.length === 0) return;
    usernamesToFetch.forEach(async (username) => {
      fetchingProfiles.current[username] = true;
      try {
        const res = await axios.get(`${API_BASE}/user/public/${encodeURIComponent(username)}`);
        const img = res.data?.profile?.profileImage || null;
        setProfileImages(prev => ({ ...prev, [username]: img }));
      } catch (err) {
        setProfileImages(prev => ({ ...prev, [username]: null }));
      }
    });
  }, [notifications, profileImages]);

  // Mark notifications as read after fetching
  useEffect(() => {
    async function markAsRead() {
      if (!notifications.length) return;
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await fetch(`${API_BASE}/user/notifications/mark-read`, { method: 'POST', headers });
      } catch (err) {
        // Ignore errors for marking as read
      }
    }
    markAsRead();
  }, [notifications.length]);
  // Format time similar to client (e.g., '2 min ago', '1 hour ago')
  function formatRelativeTime(date) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 1) {
      if (diffHour < 1) {
        if (diffMin < 1) return 'just now';
        return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
      }
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    }
    if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    }
    const diffWeek = Math.floor(diffDay / 7);
    if (diffWeek < 5) {
      return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
    }
    const diffMonth = Math.floor(diffDay / 30.44);
    if (diffMonth < 12) {
      return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    }
    const diffYear = Math.floor(diffDay / 365.25);
    return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
  }

  const renderItem = ({ item }) => {
    // Use cached profile image if available
    const username = item.from?.username || item.username;
    const profileImage = username && profileImages[username] ? profileImages[username] : null;
    const styledUsername = (item.username && !/^\w{24}$/.test(item.username))
      ? item.username
      : (item.user && !/^\w{24}$/.test(item.user))
        ? item.user
        : (item.from?.username && !/^\w{24}$/.test(item.from.username))
          ? item.from.username
          : '';
    // Navigation logic based on notification type
    const handleNotificationPress = async () => {
      // Payment notification: fetch payment object and navigate
  if (item.type === 'badge_payment' && item.payment) {
        try {
          const paymentObj = await getBadgePaymentById(item.payment);
          if (paymentObj) {
            paymentObj._paymentType = 'badge';
            navigation.navigate('PaymentsDetailScreen', { paymentId: paymentObj._id || paymentObj.id, paymentType: 'badge', payment: paymentObj });
          } else {
            navigation.navigate('PaymentsDetailScreen', { paymentId: item.payment, paymentType: 'badge' });
          }
        } catch (err) {
          navigation.navigate('PaymentsDetailScreen', { paymentId: item.payment, paymentType: 'badge' });
        }
        return;
      }
  if (item.type === 'journal_payment' && item.payment) {
        try {
          const paymentObj = await getJournalPaymentById(item.payment);
          if (paymentObj) {
            paymentObj._paymentType = 'journal';
            navigation.navigate('PaymentsDetailScreen', { paymentId: paymentObj._id || paymentObj.id, paymentType: 'journal', payment: paymentObj });
          } else {
            navigation.navigate('PaymentsDetailScreen', { paymentId: item.payment, paymentType: 'journal' });
          }
        } catch (err) {
          navigation.navigate('PaymentsDetailScreen', { paymentId: item.payment, paymentType: 'journal' });
        }
        return;
      }
      // Log post-related navigation
      if (item.post) {
        const params = { postId: item.post };
        if (item.comment) params.commentId = item.comment;
        if (item.reply) params.replyId = item.reply;
        navigation.navigate('PostDetailScreen', params);
        return;
      }
      // Post-related notifications
      if (item.post) {
        // Comment/reply navigation
        const params = { postId: item.post };
        if (item.comment) params.commentId = item.comment;
        if (item.reply) params.replyId = item.reply;
        navigation.navigate('PostDetailScreen', params);
        return;
      }
    };
    return (
      <TouchableOpacity onPress={handleNotificationPress} activeOpacity={0.7}>
        <View style={styles.notificationRow}>
          {/* Avatar and message on same row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity
              disabled={!styledUsername}
              onPress={() => styledUsername && navigation.navigate('PublicProfileScreen', { username: styledUsername })}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="user" size={22} color="#888" />
                </View>
              )}
            </TouchableOpacity>
            <View style={[styles.notificationContent, { flex: 1 }]}>  
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Username clickable */}
                <Text
                  style={styles.user}
                  onPress={() => styledUsername && navigation.navigate('PublicProfileScreen', { username: styledUsername })}
                >
                  {styledUsername}
                </Text>
                {/* Always add a space between username and message if both exist */}
                {styledUsername && (item.message || item.text || item.body) ? <Text> </Text> : null}
                <Text style={styles.message}>{
                  (() => {
                    let msg = item.message || item.text || item.body || '';
                    // Format payment figures with commas
                    if ((item.type === 'badge_payment' || item.type === 'journal_payment') && typeof item.amount === 'number') {
                      msg = msg.replace(/\d+(?:,\d{3})*/, item.amount.toLocaleString());
                    }
                    if (styledUsername && msg.startsWith(styledUsername)) {
                      msg = msg.slice(styledUsername.length).replace(/^\s+/, '');
                    }
                    return msg;
                  })()
                }</Text>
              </View>
              <Text style={styles.time}>{formatRelativeTime(item.time || item.createdAt)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
        <MainHeader
          title="Notifications"
          onCommunity={() => navigation.navigate('PostsFeed')}
          onMessages={() => navigation.navigate('MessagesScreen')}
          onNotifications={() => navigation.navigate('NotificationsScreen')}
          onProfile={() => navigation.navigate('PublicProfileScreen')}
        />
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => String(item.id || item._id || Math.random())}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 100, paddingBottom: 12 }}
          style={{ flex: 1 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No notifications yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 2,
    flexWrap: 'nowrap',
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  notificationText: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
    flexWrap: 'wrap',
    flexShrink: 1,
    width: '100%',
  },
  user: {
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  message: {
    color: '#222',
    fontWeight: 'normal',
  },
  time: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});
