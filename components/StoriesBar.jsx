import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useUser } from '../context/user';

const stories = [
  { id: 'me', user: 'You', seen: false },
  { id: '1', user: 'Alice', seen: false },
  { id: '2', user: 'Bob', seen: true },
  { id: '3', user: 'Charlie', seen: false },
  { id: '4', user: 'Diana', seen: true },
  { id: '5', user: 'Eve', seen: false },
  // ...more sample stories
];

export default function StoriesBar() {
  const { user } = useUser();
  let profileImage = null;
  if (user) {
    if (user.profile && (user.profile.profileImage || user.profile.avatar)) {
      profileImage = user.profile.profileImage || user.profile.avatar;
    } else if (user.profileImage || user.avatar) {
      profileImage = user.profileImage || user.avatar;
    }
  }
  return (
    <View style={[styles.storiesBarRoot]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, alignItems: 'center' }}>
        {stories.map(story => (
          <View key={story.id} style={styles.storyItem}>
            <View style={[styles.storyAvatar, story.seen ? styles.storySeen : styles.storyUnseen]}>
              {story.id === 'me' && profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : null}
              {story.id === 'me' && (
                <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={() => { /* Add story action */ }}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.storyUser} numberOfLines={1}>{typeof story.user === 'string' ? story.user : ''}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  storyItem: {
    alignItems: 'center',
    marginRight: 10, // reduced space between stories
    width: 56 // slightly reduced width
  },
  storyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 4,
    backgroundColor: '#e5e7eb',
    borderWidth: 3
  },
  storyUnseen: {
    borderColor: '#a99d6b' // gold for new stories
  },
  storySeen: {
    borderColor: '#d1d5db' // gray for seen stories
  },
  storyUser: {
    fontSize: 12,
    color: '#222',
    textAlign: 'center',
    width: 56
  },
  profileImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  addButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22
  },
  storiesBarRoot: {
    marginTop: 8, // reduced space above stories
    paddingTop: 1, // further reduce top padding
    paddingBottom: 4,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    zIndex: 10
  }
});
