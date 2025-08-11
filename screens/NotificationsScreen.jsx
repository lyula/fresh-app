import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import MainHeader from '../components/MainHeader';
import { useNavigation } from '@react-navigation/native';

const notifications = [
  { id: '1', type: 'like', user: 'Alice', message: 'liked your post', time: '2m ago' },
  { id: '2', type: 'comment', user: 'Bob', message: 'commented: Nice work!', time: '10m ago' },
  { id: '3', type: 'follow', user: 'Charlie', message: 'started following you', time: '1h ago' },
  // ...more sample notifications
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const renderItem = ({ item }) => (
    <View style={styles.notificationRow}>
      <View style={styles.avatarPlaceholder} />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText} numberOfLines={1}>
          <Text style={styles.user}>{item.user} </Text>
          {item.message}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
        <MainHeader
          title="Notifications"
          onCommunity={() => navigation.navigate('PostsFeed')}
          onMessages={() => navigation.navigate('MessagesScreen')}
          onNotifications={() => navigation.navigate('NotificationsScreen')}
          onProfile={() => navigation.navigate('ProfileScreen')}
        />
      </View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 12 }}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 2,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 15,
    color: '#222',
  },
  user: {
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});
