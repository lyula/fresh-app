import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { likePost } from '../utils/api';
import { useUser } from '../context/user';


export default function PostsInteractionBar({ likes, comments, shareCount, views, postId, likedBy = [], onComment, onShare, onLikesPress }) {
  const { userId } = useUser();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes || 0);

  useEffect(() => {
    if (Array.isArray(likedBy) && userId) {
      setLiked(likedBy.some(u => u === userId || u?._id === userId));
    } else {
      setLiked(false);
    }
    setLikesCount(likes || 0);
  }, [likedBy, userId, likes]);

  const handleLike = async () => {
    setLiked(prev => !prev);
    setLikesCount(prev => prev + (liked ? -1 : 1));
    try {
      await likePost(postId);
    } catch (e) {
      // Optionally show error or revert state
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.actionBtn}>
          <TouchableOpacity onPress={handleLike}>
            <Icon name={liked ? 'heart' : 'heart-o'} size={18} color={liked ? '#e11d48' : '#e53935'} />
          </TouchableOpacity>
          <View style={{ width: 8 }} />
          <TouchableOpacity onPress={onLikesPress} disabled={!onLikesPress}>
            <Text style={[styles.actionText, liked && { color: '#e11d48' }]}>{likesCount}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={onComment} activeOpacity={0.7}>
          <Icon name="comment" size={18} color="#6b7280" />
          <View style={{ width: 8 }} />
          <Text style={styles.actionText}>{comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
          <Icon name="share" size={16} color="#6b7280" />
          <Text style={styles.actionText}>{shareCount}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.viewsContainer}>
        <MaterialCommunityIcons name="chart-bar" size={17} color="#6b7280" />
        <Text style={styles.actionText}>{views || 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
    paddingLeft: 13,
    paddingRight: 13,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  actionText: {
    marginLeft: 5,
    color: '#444',
    fontSize: 15,
    fontWeight: '500',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
});
