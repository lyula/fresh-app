import React, { useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

export default function UserList({ users, onUserPress, placeholder }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder={placeholder}
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#888"
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item._id || item.id || item.username}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => onUserPress(item)}>
            <Image
              source={{ uri: item.profileImage || item.avatar || (item.profile && (item.profile.profileImage || item.profile.avatar)) || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.username}>{item.username}</Text>
              {item.name && <Text style={styles.name}>{item.name}</Text>}
            </View>
            {item.verified && (
              <Image source={require('../assets/blue-badge.png')} style={styles.badge} />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    flex: 1,
  },
  search: {
    width: '90%',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    marginBottom: 10,
    fontSize: 16,
    color: '#222',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  name: {
    fontSize: 14,
    color: '#888',
  },
  badge: {
    width: 18,
    height: 18,
    marginLeft: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 24,
    fontSize: 16,
  },
});
