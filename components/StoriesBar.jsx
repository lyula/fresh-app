import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

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
  return (
    <View style={[styles.storiesBarRoot]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, alignItems: 'center' }}>
        {stories.map(story => (
          <View key={story.id} style={styles.storyItem}>
            <View style={[styles.storyAvatar, story.seen ? styles.storySeen : styles.storyUnseen]}>
              {story.id === 'me' && (
                <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={() => { /* Add story action */ }}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.storyUser} numberOfLines={1}>{story.user}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  storyItem: {
    alignItems: 'center',
    marginRight: 18,
    width: 60
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
    marginTop: 26,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    zIndex: 10
  }
});
