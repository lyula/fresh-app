import React, { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';

export default function PostDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId, commentId, replyId } = route.params || {};
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = Constants.expoConfig?.extra?.API_BASE_URL || Constants.manifest?.extra?.API_BASE_URL;

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/posts/${postId}`);
        if (!res.ok) throw new Error('Post not found');
        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    }
    if (postId) fetchPost();
  }, [postId]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1E3A8A" /></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  }
  if (!post) {
    return <View style={styles.center}><Text style={styles.error}>Post not found.</Text></View>;
  }

  // Ensure author info is nested for PostCard
  const postWithAuthor = {
    ...post,
    author: post.author || {
      username: post.username,
      name: post.name,
      profileImage: post.profileImage,
      avatar: post.avatar,
      verified: post.verified,
      badge: post.badge,
      _id: post.userId || post._id || post.id,
    },
  };

  return (
    <View style={styles.centeredWrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.centeredContent}>
        {/* Render full PostCard at the top, with media margin matching feed */}
        <View style={styles.feedPostWrapper}>
          <PostCard post={postWithAuthor} navigation={navigation} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centeredWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    minHeight: '100%',
    width: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  error: {
    color: '#ef4444',
    fontSize: 16,
    marginTop: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#e5e7eb',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1E3A8A',
  },
  postImage: {
    width: 320,
    height: 320,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#e5e7eb',
  },
  caption: {
    fontSize: 16,
    color: '#222',
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  stat: {
    fontSize: 14,
    color: '#888',
    marginRight: 16,
  },
  commentsSection: {
    width: '100%',
    marginTop: 10,
    paddingTop: 10,
  },
  // ...existing code...
  feedPostWrapper: {
    marginLeft: 0, // Match feed margin, adjust as needed
    marginRight: 0,
    // Add any other styles from feed post wrapper if needed
  },
  commentUser: {
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginRight: 6,
  },
  commentText: {
    color: '#222',
  },
});
