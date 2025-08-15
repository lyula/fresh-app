
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function PostSkeleton() {
  return (
    <View>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar} />
          <View style={styles.usernameRow}>
            <View style={styles.username} />
            <View style={styles.badgeIcon} />
            <View style={styles.badgeText} />
            <View style={styles.dot} />
            <View style={styles.time} />
          </View>
          <View style={styles.menuIcon} />
        </View>
        <View style={styles.content} />
        <View style={styles.postImage} />
        <View style={styles.interactionBar} />
      </View>
      <View style={styles.hr} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    marginBottom: -4,
    marginTop: 18,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 13,
    paddingRight: 13,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    marginTop: 0,
    backgroundColor: '#e5e7eb',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flex: 1,
  },
  username: {
    width: 80,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginRight: 4,
  },
  badgeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e5e7eb',
    marginRight: 2,
  },
  badgeText: {
    width: 40,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    marginRight: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginRight: 4,
  },
  time: {
    width: 40,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
    marginLeft: 12,
  },
  menuIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e5e7eb',
    marginLeft: 8,
    padding: 4,
  },
  content: {
    width: '100%',
    height: 18,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
    paddingLeft: 13,
    paddingRight: 13,
  },
  postImage: {
    height: 180,
    borderRadius: 0,
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    width: '100%',
  },
  interactionBar: {
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 13,
  },
  hr: {
    height: 2,
    backgroundColor: '#bdbdbd',
    width: '100%',
    marginTop: 10,
    marginBottom: 18,
    alignSelf: 'center',
    opacity: 1,
  },
});
