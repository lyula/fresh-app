import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/user';
import PostLikesModal from './PostLikesModal';
import PostComments from './PostComments';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Video } from 'expo-av';
// Instagram aspect ratio constants
const INSTAGRAM_MAX_RATIO = 1.25; // 4:5 portrait
const INSTAGRAM_MIN_RATIO = 1 / 1.91; // 1.91:1 landscape
import Icon from 'react-native-vector-icons/FontAwesome';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import PostsInteractionBar from './PostsInteractionBar';
import { formatDurationAgo } from '../utils/time';
// Use client format for time ago
function formatPostDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // difference in seconds
  if (diff < 60) return "now";
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins}m ago`;
  }
  if (diff < 86400) {
    const hrs = Math.floor(diff / 3600);
    return `${hrs}h ago`;
  }
  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  }
  if (diff < 2592000) {
    const weeks = Math.floor(diff / 604800);
    return `${weeks}w ago`;
  }
  if (diff < 31536000) {
    const months = Math.floor(diff / 2592000);
    return `${months}mo ago`;
  }
  const years = Math.floor(diff / 31536000);
  return `${years}y ago`;
}
import { incrementPostShareCount, editPost, deletePost } from '../utils/api';

export default function PostCard({ post, navigation, onPostDeleted, onPostEdited, isVisible = true }) {
  const { userId } = useUser();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [mediaHeight, setMediaHeight] = useState(screenWidth); // default square
  const [menuVisible, setMenuVisible] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const handleEdit = async () => {
    setMenuVisible(false);
    // Simple prompt for new content (replace with modal for production)
    const newContent = prompt('Edit post content:', post.content);
    if (newContent && newContent !== post.content) {
      try {
        const res = await editPost(post._id || post.id, newContent, post.image);
        if (onPostEdited) onPostEdited(res);
        alert('Post updated!');
      } catch (err) {
        alert('Failed to edit post');
      }
    }
  };
  const handleDelete = async () => {
    setMenuVisible(false);
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post._id || post.id);
        if (onPostDeleted) onPostDeleted(post._id || post.id);
        alert('Post deleted!');
      } catch (err) {
        alert('Failed to delete post');
      }
    }
  };
  const author = post.author || post.user || {};
  const authorId = author._id || author.id;
  const avatar = author.profileImage || author.avatar || (author.profile?.profileImage) || null;
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
  // Modal state
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);

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

  // Modal handlers
  const handleOpenLikes = () => setLikesModalVisible(true);
  const handleCloseLikes = () => setLikesModalVisible(false);
  const handleOpenComments = () => setCommentsModalVisible(true);
  const handleCloseComments = () => setCommentsModalVisible(false);

  return (
    <View>
      <View style={styles.card}>
        <View style={styles.header}>
          {avatar ? (
            <TouchableOpacity onPress={() => {
              if (author.username && navigation) {
                navigation.navigate('PublicProfileScreen', { username: author.username });
              }
            }}>
              <Image source={{ uri: avatar }} style={styles.avatar} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => {
              if (author.username && navigation) {
                navigation.navigate('PublicProfileScreen', { username: author.username });
              }
            }}>
              <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' }]}> 
                <Icon name="user" size={22} color="#888" />
              </View>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
            <View style={styles.usernameRow}>
              <TouchableOpacity onPress={() => {
                if (author.username) {
                  // Use navigation from props or context
                  if (typeof navigation !== 'undefined') {
                    navigation.navigate('PublicProfileScreen', { username: author.username });
                  }
                }
              }}>
                <Text style={styles.username}>{author.name || author.username || 'Unknown'}</Text>
              </TouchableOpacity>
              {author.verified && (
                <Image source={require('../assets/blue-badge.png')} style={{ width: 20, height: 20, marginRight: 4 }} />
              )}
              {author.badge && author.badge.icon && (
                <View style={styles.badgeRow}>
                  <Image source={{ uri: author.badge.icon }} style={styles.badgeIcon} />
                  <Text style={styles.badgeText}>{author.badge.name}</Text>
                </View>
              )}
              <Text style={styles.dot}>•</Text>
              <Text style={[styles.time, { marginLeft: 12 }]}>{formatPostDate(post.createdAt)}</Text>
            </View>
          </View>
          {/* Only show menu button if current user is the author */}
          {userId === authorId && (
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginLeft: 8, padding: 4 }}>
              <MaterialIcons name="more-vert" size={22} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        {/* Show only first 3 lines of content, with More/Less inline link */}
       
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
        {post.video ? (
          <View style={{ width: screenWidth, alignSelf: 'center' }}>
            <Video
              source={{ uri: post.video }}
              style={{ width: screenWidth, height: mediaHeight, backgroundColor: '#000' }}
              resizeMode="cover"
              useNativeControls
              shouldPlay={isVisible}
              isLooping
              onLoad={event => {
                const { width, height } = event.naturalSize || {};
                if (width && height) {
                  const aspectRatio = height / width;
                  let displayHeight = screenWidth * aspectRatio;
                  if (aspectRatio > INSTAGRAM_MAX_RATIO) {
                    displayHeight = screenWidth * INSTAGRAM_MAX_RATIO;
                  } else if (aspectRatio < INSTAGRAM_MIN_RATIO) {
                    displayHeight = screenWidth * INSTAGRAM_MIN_RATIO;
                  }
                  if (displayHeight > screenHeight) displayHeight = screenHeight;
                  setMediaHeight(displayHeight);
                } else {
                  setMediaHeight(screenWidth);
                }
              }}
            />
          </View>
        ) : null}
         <View style={{ marginBottom: 8, paddingLeft: 6, paddingRight: 6, paddingTop: 4 }}>
          <Text
            style={styles.content}
            numberOfLines={showFullContent ? undefined : 3}
            ellipsizeMode={'tail'}
          >
            {content}
          </Text>
          {!showFullContent && (content && (content.split('\n').length > 3 || content.length > 200)) ? (
            <TouchableOpacity onPress={() => setShowFullContent(true)}>
              <Text style={{ color: '#1E3A8A', fontWeight: 'bold', marginTop: 2 }}>
                Read more
              </Text>
            </TouchableOpacity>
          ) : null}
          {showFullContent && (content && (content.split('\n').length > 3 || content.length > 200)) ? (
            <TouchableOpacity onPress={() => setShowFullContent(false)}>
              <Text style={{ color: '#1E3A8A', fontWeight: 'bold', marginTop: 2 }}>
                Less
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <PostsInteractionBar
          likes={likes}
          comments={comments}
          shareCount={shareCount}
          views={post.views || 0}
          postId={post._id || post.id}
          likedBy={Array.isArray(post.likes) ? post.likes.map(u => u._id || u) : []}
          onComment={handleOpenComments}
          onShare={handleShare}
          onLikesPress={handleOpenLikes}
        />
      </View>
      {/* Faint horizontal rule below each post */}
      {/* Likes Modal */}
      <PostLikesModal
        visible={likesModalVisible}
        postId={post._id || post.id}
        onClose={handleCloseLikes}
      />
      {/* Comments Modal */}
      <PostComments
        visible={commentsModalVisible}
        postId={post._id || post.id}
        onClose={handleCloseComments}
      />
      <View style={styles.hr} />
      {/* Menu modal */}
      {/* Only show menu modal if current user is the author */}
      {userId === authorId && (
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
      )}
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
  headerWithPad: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  paddingTop: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    marginTop: 0,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginTop: 4,
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
    width: 22,
    height: 22,
    marginRight: 2,
  },
  badgeText: {
    fontSize: 12,
    color: '#1E3A8A',
    marginRight: 2,
  },
  hr: {
    height: 2,
    backgroundColor: '#bdbdbd', // darker gray for more contrast
    width: '100%',
    marginTop: 10,
    marginBottom: 18,
    alignSelf: 'center',
    opacity: 1,
  },
  content: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
    paddingLeft: 13,
    paddingRight: 13,
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
    backgroundColor: '#6b7280', // match comments icon color
    width: '100vw',
    marginLeft: -24,
    marginRight: -24,
    marginTop: 14, // Restored gap below interaction bar
    marginBottom: 0,
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
  dot: {
    fontSize: 16,
    color: '#888',
    marginLeft: 4,
    marginRight: 4,
    fontWeight: 'bold',
  },
});

// Only one StyleSheet block should exist. The above block is correct and complete. Remove the duplicate below.
