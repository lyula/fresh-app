import React, { useEffect, useState } from 'react';
import { getProfileSuggestions as fetchProfileSuggestions } from '../utils/api';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function getProfileImage(user) {
  if (!user) return '';
  if (user.profile && typeof user.profile === 'object' && user.profile.profileImage) return user.profile.profileImage;
  if (user.profileImage) return user.profileImage;
  if (typeof user.profile === 'string') return user.profile;
  return '';
}

export default function ProfileSuggestions({ currentUser, onFollow, onDismiss }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    if (!currentUser?._id) return;
    let mounted = true;
    setLoading(true);
    fetchProfileSuggestions(currentUser._id)
      .then(data => {
        let suggestionsArr = data.suggestions || [];
        // Filter out users already followed
        const followingRaw = currentUser?.followingRaw || [];
        suggestionsArr = suggestionsArr.filter(s => !followingRaw.includes(s._id));
        // Filter out dismissed
        suggestionsArr = suggestionsArr.filter(s => !dismissed.includes(s._id));
        // Sort: profile image first, then verified
        suggestionsArr.sort((a, b) => {
          const aHasImage = !!getProfileImage(a);
          const bHasImage = !!getProfileImage(b);
          if (aHasImage && !bHasImage) return -1;
          if (!aHasImage && bHasImage) return 1;
          if (a.verified && !b.verified) return -1;
          if (!a.verified && b.verified) return 1;
          return 0;
        });
        if (mounted) setSuggestions(suggestionsArr);
      })
      .catch(() => { if (mounted) setSuggestions([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [currentUser, dismissed]);

  const handleFollow = (id) => {
    setFollowing(prev => [...prev, id]);
    if (onFollow) onFollow(id);
  };
  const handleDismiss = (id) => {
    setDismissed(prev => [...prev, id]);
    if (onDismiss) onDismiss(id);
  };

  const visibleSuggestions = suggestions.filter(s => !dismissed.includes(s._id));

  if (loading) {
    return (
      <View style={styles.skeletonContainer}>
        <Text style={styles.header}>Suggested for you</Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {[...Array(3)].map((_, i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonAvatar} />
              <View style={styles.skeletonLine} />
              <View style={styles.skeletonLineSmall} />
              <View style={styles.skeletonBtn} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (visibleSuggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingHorizontal: 8 }}>
        <Text style={styles.header}>Suggested for you</Text>
      </View>
      <FlatList
        data={visibleSuggestions}
        horizontal
        keyExtractor={item => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity style={styles.dismissBtn} onPress={() => handleDismiss(item._id)}>
              <Ionicons name="close" size={18} color="#888" />
            </TouchableOpacity>
            <View style={styles.avatarWrapper}>
              {getProfileImage(item) ? (
                <Image source={{ uri: getProfileImage(item) }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}> 
                  <Ionicons name="person" size={32} color="#bbb" />
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, justifyContent: 'center' }}>
              <Text style={styles.name} numberOfLines={1}>{item.username}</Text>
              {item.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#1E3A8A" style={{ marginLeft: 4, marginBottom: -2 }} />
              )}
            </View>
            {item.commonFollower && item.commonFollower.username ? (
              <Text style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', marginBottom: 4 }}>
                Followed by {item.commonFollower.username}
              </Text>
            ) : (
              <Text style={styles.suggestedText}>Suggested for you</Text>
            )}
            <TouchableOpacity
              style={[styles.followBtn, following.includes(item._id) && styles.followingBtn]}
              onPress={() => handleFollow(item._id)}
              disabled={following.includes(item._id)}
            >
              <Text style={{ color: following.includes(item._id) ? '#1E3A8A' : '#fff', fontWeight: 'bold', fontSize: 13 }}>
                {following.includes(item._id) ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const CARD_WIDTH = 140;
const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingBottom: 6, // Reduced bottom padding for less space below cards
    backgroundColor: '#f3f4f6', // More distinct, matches client suggestion bg
  },
  header: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginLeft: 12,
    marginBottom: 8,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff', // Match post card color
    borderRadius: 6, // Reduced border-radius for less rounded appearance
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 200, // Increased height for longer cards
    maxWidth: CARD_WIDTH,
    borderWidth: 0, // Remove colored borders
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 0, // Remove colored borders
    overflow: 'hidden',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    maxWidth: 90,
    textAlign: 'center',
  },
  suggestedText: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    marginBottom: 6,
    textAlign: 'center',
  },
  followBtn: {
    marginTop: 6,
    backgroundColor: '#1E3A8A',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 18,
    alignItems: 'center',
    minWidth: 90,
  },
  followingBtn: {
    backgroundColor: '#e0e7ff',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  dismissBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 2,
  },
  skeletonContainer: {
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  skeletonLine: {
    width: 60,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonLineSmall: {
    width: 40,
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonBtn: {
    width: 70,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
});
