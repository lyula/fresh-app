import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
// Instagram aspect ratio constants
const INSTAGRAM_MAX_RATIO = 1.25; // 4:5 portrait
const INSTAGRAM_MIN_RATIO = 1 / 1.91; // 1.91:1 landscape
import Icon from 'react-native-vector-icons/FontAwesome';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import PostsInteractionBar from './PostsInteractionBar';
import { formatDurationAgo } from '../utils/time';
import { incrementPostShareCount } from '../utils/api';

export default function PostCard({ post }) {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [mediaHeight, setMediaHeight] = useState(screenWidth); // default square
  const [menuVisible, setMenuVisible] = useState(false);
  const handleEdit = () => {
    setMenuVisible(false);
    // TODO: Implement edit logic
    alert('Edit post');
  };
  const handleDelete = () => {
    setMenuVisible(false);
    // TODO: Implement delete logic
    alert('Delete post');
  };
  const author = post.author || post.user || {};
  const avatar = author.profileImage || author.avatar || (author.profile && author.profile.profileImage) || 'https://ui-avatars.com/api/?name=User';
  let content = '';
  if (typeof post.content === 'string') {
    content = post.content;
  } else if (post.content && typeof post.content === 'object') {
    content = post.content.text || JSON.stringify(post.content);
  }

  let likes = 0;
  if (typeof post.likes === 'number') likes = post.likes;
  else if (Array.isArray(post.likes)) likes = post.likes.length;

  let comments = 0;
  if (typeof post.comments === 'number') comments = post.comments;
  else if (Array.isArray(post.comments)) comments = post.comments.length;
  else if (Array.isArray(post.replies)) comments = post.replies.length;

  // Share count state
  const [shareCount, setShareCount] = useState(post.shares || post.shareCount || 0);

  // Update share count if post prop changes
  useEffect(() => {
    setShareCount(post.shares || post.shareCount || 0);
  }, [post.shares, post.shareCount]);

  // Share handler
  const handleShare = async () => {
    try {
      const res = await incrementPostShareCount(post._id || post.id);
      setShareCount(res.shareCount || (shareCount + 1));
    } catch (err) {
      setShareCount(shareCount + 1); // fallback
    }
    // TODO: Add actual share logic (native share sheet, etc.)
  };

  return (
    <View>
      <View style={styles.card}>
        <View style={styles.header}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}> 
              <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 18 }}>
                {(author.username && author.username[0]) ? author.username[0].toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{author.name || author.username || 'Unknown'}</Text>
              {author.verified && (
                <Image source={require('../assets/blue-badge.png')} style={{ width: 16, height: 16 }} />
              )}
              {author.badge && author.badge.icon && (
                <View style={styles.badgeRow}>
                  <Image source={{ uri: author.badge.icon }} style={styles.badgeIcon} />
                  <Text style={styles.badgeText}>{author.badge.name}</Text>
                </View>
              )}
            </View>
            <Text style={styles.time}>{formatDurationAgo(post.createdAt)}</Text>
          </View>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginLeft: 8, padding: 4 }}>
            <MaterialIcons name="more-vert" size={22} color="#888" />
          </TouchableOpacity>
        </View>
        <Text style={styles.content}>{content}</Text>
        {post.image ? (
          <Image
            source={{ uri: post.image }}
            style={[
              styles.postImage,
              {
                width: screenWidth,
                height: mediaHeight,
                alignSelf: 'center',
                marginLeft: 0,
                marginRight: 0,
              },
            ]}
            resizeMode="cover"
            onLoad={({ nativeEvent }) => {
              const { width, height } = nativeEvent.source;
              if (width && height) {
                const aspectRatio = height / width;
                let displayHeight = screenWidth * aspectRatio;
                // Clamp to Instagram's portrait/landscape rules
                if (aspectRatio > INSTAGRAM_MAX_RATIO) {
                  displayHeight = screenWidth * INSTAGRAM_MAX_RATIO;
                } else if (aspectRatio < INSTAGRAM_MIN_RATIO) {
                  displayHeight = screenWidth * INSTAGRAM_MIN_RATIO;
                }
                // Never exceed screen height
                if (displayHeight > screenHeight) displayHeight = screenHeight;
                setMediaHeight(displayHeight);
              } else {
                setMediaHeight(screenWidth); // fallback to square
              }
            }}
          />
        ) : null}
        <PostsInteractionBar
          likes={likes}
          comments={comments}
          shareCount={shareCount}
          views={post.views || 0}
          onLike={() => {}}
          onComment={() => {}}
          onShare={handleShare}
        />
      </View>
      {/* Faint horizontal rule below each post */}
      <View style={styles.hr} />
      {/* Menu modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setMenuVisible(false)}>
          <View style={styles.menuModal}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <MaterialIcons name="edit" size={20} color="#007AFF" />
              <Text style={styles.menuText}>Edit Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <MaterialIcons name="delete" size={20} color="#FF3B30" />
              <Text style={[styles.menuText, { color: '#FF3B30' }]}>Delete Post</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    marginBottom: 0,
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
  },
  headerWithPad: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    marginTop: 12,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1E3A8A',
    marginRight: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  badgeIcon: {
    width: 16,
    height: 16,
    marginRight: 2,
  },
  badgeText: {
    fontSize: 12,
    color: '#1E3A8A',
    marginRight: 2,
  },
  dot: {
    color: '#888',
    fontSize: 14,
    marginHorizontal: 4,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  content: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
  },
  postImage: {
    height: 480,
    borderRadius: 0,
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    paddingLeft: 0,
    paddingRight: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  actionText: {
    marginLeft: 4,
    color: '#222',
    fontSize: 14,
  },
  hr: {
    height: 1,
    backgroundColor: '#ececec',
    width: '100vw',
    marginLeft: -24,
    marginRight: -24,
    marginVertical: 0,
    opacity: 0.7,
  },
  impressionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  impressionsText: {
    marginLeft: 4,
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  // Menu modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    minWidth: 180,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#222',
  },
});

// Only one StyleSheet block should exist. The above block is correct and complete. Remove the duplicate below.
