import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import StoriesBar from '../components/StoriesBar';
import MainHeader from '../components/MainHeader';
import { useNavigation } from '@react-navigation/native';


const messages = [
  { id: '1', user: 'Alice', lastMessage: 'Hey, how are you?', time: '2m ago' },
  { id: '2', user: 'Bob', lastMessage: 'Let’s catch up soon!', time: '10m ago' },
  { id: '3', user: 'Charlie', lastMessage: 'Sent the files.', time: '1h ago' },
  // ...more sample messages
];

export default function MessagesScreen() {
  const navigation = useNavigation();
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.messageRow} activeOpacity={0.85}>
      <View style={styles.avatarShadow}>
        <View style={styles.avatarPlaceholder} />
      </View>
      <View style={styles.messageContent}>
        <Text style={styles.user}>{item.user}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
        <MainHeader
          title="Messages"
          onCommunity={() => navigation.navigate('PostsFeed')}
          onMessages={() => navigation.navigate('MessagesScreen')}
          onNotifications={() => navigation.navigate('NotificationsScreen')}
          onProfile={() => navigation.navigate('ProfileScreen')}
        />
      </View>
      {/* Stories feature */}
      <View style={{ marginTop: 56 }}>
        <StoriesBar />
      </View>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 120, paddingBottom: 12 }}
        style={{ flex: 1 }}
      />
    </View>
  );
  // ...existing code...
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 8,
    marginBottom: 4,
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
