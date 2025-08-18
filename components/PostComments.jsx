import React, { useEffect, useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/user';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Modal, Keyboard } from 'react-native';
import { getPostById, getPostComments, getTotalCommentCount, likePost, likeComment, likeReply, addCommentToPost, addReplyToComment } from '../utils/api';
import { Ionicons, Feather } from '@expo/vector-icons';
// Use the exact badge URI and style as post author badge
const VERIFIED_BADGE_URI = 'https://zack-lyula-portfolio.vercel.app/images/blue-badge.png';
const VERIFIED_BADGE_STYLE = { width: 18, height: 18, marginLeft: 1 };

export default function PostComments({ postId, visible, onClose }) {
  const navigation = useNavigation();
  const { userId } = useUser();
  const [comments, setComments] = useState([]);
  // Helper to check if current user liked a comment/reply
  const isLikedByUser = (likesArr) => {
    if (!Array.isArray(likesArr) || !userId) return false;
    return likesArr.some(u => u === userId || u?._id === userId);
  };
  // For every 5 comments, show at least one reply by default (if available)
  React.useEffect(() => {
    if (!Array.isArray(comments) || comments.length === 0) return;
    const newShowReplies = { ...showReplies };
    for (let i = 0; i < comments.length; i += 5) {
      const block = comments.slice(i, i + 5);
      const withReplies = block.filter(c => Array.isArray(c.replies) && c.replies.length > 0);
      if (withReplies.length > 0) {
        // Pick a random comment with replies in this block
        const randomIdx = Math.floor(Math.random() * withReplies.length);
        const commentId = withReplies[randomIdx]._id;
        if (!newShowReplies[commentId]) {
          newShowReplies[commentId] = true;
        }
      }
    }
    setShowReplies(newShowReplies);
  }, [comments]);

  // Track reply pagination state per comment
  const [replyPages, setReplyPages] = useState({}); // { [commentId]: pageNumber }
  const REPLIES_PER_PAGE = 4;

  // Robustly extract the profile image from any author object, handling all backend structures
  // Fallback to DiceBear initials avatar if no image is found
  const getProfileImage = (author) => {
    if (!author) return 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    if (author.profile && typeof author.profile === 'object' && author.profile.profileImage) return author.profile.profileImage;
    if (author.profileImage) return author.profileImage;
    if (typeof author.profile === 'string') return author.profile;
    if (author.profile && typeof author.profile === 'object' && author.profile.profileImage) return author.profile.profileImage;
    if (author.profileImage) return author.profileImage;
    return 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  };

  const [replyLikeLoading, setReplyLikeLoading] = useState({}); // { [replyId]: bool }
  const [commentLikeLoading, setCommentLikeLoading] = useState({}); // { [commentId]: bool }

  const handleReplyLike = async (replyId, likesArr) => {
    if (replyLikeLoading[replyId]) return;
    setReplyLikeLoading(l => ({ ...l, [replyId]: true }));
    // Optimistically update UI instantly
    setComments(comments => comments.map(c => ({
      ...c,
      replies: c.replies?.map(r =>
        r._id === replyId
          ? {
              ...r,
              likes: isLikedByUser(r.likes)
                ? r.likes.filter(u => (u === userId || u?._id === userId) === false)
                : [...(r.likes || []), userId]
            }
          : r
      )
    })));
    try {
      // Find the parent commentId for this reply
      const parentComment = comments.find(c => Array.isArray(c.replies) && c.replies.some(r => r._id === replyId));
      if (!parentComment) throw new Error('Parent comment not found');
      await likeReply(postId, parentComment._id, replyId);
      // Only fetch latest likes count, not all comments
      // Optionally, you can skip fetching if you want pure optimistic UI
    } catch {}
    setReplyLikeLoading(l => ({ ...l, [replyId]: false }));
  };

  function renderHighlightedContent(text, navigation) {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const username = match[1];
      parts.push(
        <Text
          key={match.index}
          style={{ color: '#1E3A8A', fontWeight: '500' }}
          onPress={() => navigation && navigation.navigate('PublicProfileScreen', { username })}
        >
          @{username}
        </Text>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  }

  const renderReply = (reply) => {
    const imgUri = getProfileImage(reply.author);
    const isVerified = reply.author?.verified;
    const liked = isLikedByUser(reply.likes);
    // Find parent comment for this reply
    const parentComment = comments.find(c => Array.isArray(c.replies) && c.replies.some(r => r._id === reply._id));
    // Find username of replyTo (if available)
    let replyToUsername = '';
    if (reply.replyTo) {
      const replyToObj = parentComment?.replies?.find(r => r.author?._id === reply.replyTo || r._id === reply.replyTo);
      replyToUsername = replyToObj?.author?.username || replyToObj?.author?.name || '';
    }
    return (
      <View style={styles.replyRow} key={reply._id}>
        <TouchableOpacity onPress={() => {
          if (reply.author?.username && navigation) {
            navigation.navigate('PublicProfileScreen', { username: reply.author.username });
          }
        }}>
          <Image source={{ uri: imgUri }} style={styles.replyAvatar} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => {
              if (reply.author?.username && navigation) {
                navigation.navigate('PublicProfileScreen', { username: reply.author.username });
              }
            }} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.replyUsername}>{reply.author?.username || reply.author?.name || 'User'}</Text>{isVerified && (
                <Image source={{ uri: VERIFIED_BADGE_URI }} style={VERIFIED_BADGE_STYLE} resizeMode="contain" accessibilityLabel="Verified badge" />
              )}
            </TouchableOpacity>
            {reply.replyTo && reply.replyTo !== reply.author?._id && (
              <Text style={{ marginLeft: 8, color: '#1E3A8A', fontStyle: 'italic', fontSize: 12 }}>
                Replying to @{replyToUsername}
              </Text>
            )}
            <Text style={[styles.replyTime, { marginLeft: 8, alignSelf: 'center', marginTop: -2 }]}>{formatRelativeTime(reply.createdAt)}</Text>
          </View>
          <Text style={styles.replyText}>{renderHighlightedContent(reply.text || reply.content || '', navigation)}</Text>
          <View style={styles.commentActionsRow}>
            <TouchableOpacity style={styles.likeBtn} onPress={() => handleReplyLike(reply._id, reply.likes)} disabled={replyLikeLoading[reply._id]}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={liked ? '#e11d48' : '#e11d48'} />
              <Text style={styles.likeCount}>{reply.likes?.length || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleReplyToReply(parentComment?._id, reply._id)}>
              <Text style={styles.replyLink}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const [replyToReplyId, setReplyToReplyId] = useState(null); // replyId
  const [replyToUsername, setReplyToUsername] = useState('');

  // Reply to a comment
  const handleReply = (commentId) => {
    const comment = comments.find(c => c._id === commentId);
    const username = comment?.author?.username || comment?.author?.name || '';
    setInput(`@${username} `);
    setReplyTo(commentId);
    setReplyToReplyId(null);
    setReplyToUsername(username);
    inputRef.current?.focus();
  };
  // Reply to a reply
  const handleReplyToReply = (commentId, replyId) => {
    // Do not pre-fill @username for replies to replies
    setInput('');
    setReplyTo(commentId);
    setReplyToReplyId(replyId);
    setReplyToUsername('');
    inputRef.current?.focus();
  };

  const handleCommentLike = async (commentId, likesArr) => {
    if (commentLikeLoading[commentId]) return;
    setCommentLikeLoading(l => ({ ...l, [commentId]: true }));
    // Optimistically update UI
    setComments(comments => comments.map(c =>
      c._id === commentId
        ? {
            ...c,
            likes: isLikedByUser(c.likes)
              ? c.likes.filter(u => (u === userId || u?._id === userId) === false)
              : [...(c.likes || []), userId]
          }
        : c
    ));
    try {
      await likeComment(postId, commentId);
      // Fetch latest comments from backend to reflect true likes state
      const updatedComments = await getPostComments(postId);
      setComments(Array.isArray(updatedComments) ? updatedComments : []);
    } catch {}
    setCommentLikeLoading(l => ({ ...l, [commentId]: false }));
  };

  const renderComment = ({ item }) => {
    const hasReplies = Array.isArray(item.replies) && item.replies.length > 0;
    const shouldShowReplies = showReplies[item._id];
    const replyCount = Array.isArray(item.replies) ? item.replies.length : 0;
    const page = replyPages[item._id] || 1;
    const totalPages = hasReplies ? Math.ceil(replyCount / REPLIES_PER_PAGE) : 1;
    const startIdx = (page - 1) * REPLIES_PER_PAGE;
    const endIdx = startIdx + REPLIES_PER_PAGE;
    const visibleReplies = hasReplies && shouldShowReplies ? item.replies.slice(startIdx, endIdx) : [];

    const imgUri = getProfileImage(item.author);
    const isVerified = item.author?.verified;
    const liked = isLikedByUser(item.likes);
    return (
      <View style={styles.commentRow}>
        <TouchableOpacity onPress={() => {
          if (item.author?.username && navigation) {
            navigation.navigate('PublicProfileScreen', { username: item.author.username });
          }
        }}>
          <Image source={{ uri: imgUri }} style={styles.avatar} />
        </TouchableOpacity>
        <View style={styles.commentContentFlat}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => {
              if (item.author?.username && navigation) {
                navigation.navigate('PublicProfileScreen', { username: item.author.username });
              }
            }} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.replyUsername}>{item.author?.username || item.author?.name || 'User'}</Text>{isVerified && (
                <Image source={{ uri: VERIFIED_BADGE_URI }} style={VERIFIED_BADGE_STYLE} resizeMode="contain" accessibilityLabel="Verified badge" />
              )}
            </TouchableOpacity>
            <Text style={[styles.commentTime, { marginLeft: 8, alignSelf: 'center', marginTop: -2 }]}>{formatRelativeTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{renderHighlightedContent(item.text || item.content || '', navigation)}</Text>
          <View style={styles.commentActionsRow}>
            <TouchableOpacity style={styles.likeBtn} onPress={() => handleCommentLike(item._id, item.likes)} disabled={commentLikeLoading[item._id]}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#e11d48' : '#e11d48'} />
              <Text style={styles.likeCount}>{item.likes?.length || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleReply(item._id)}>
              <Text style={styles.replyLink}>Reply</Text>
            </TouchableOpacity>
          </View>
          {hasReplies && (
            <View style={styles.repliesBox}>
              {shouldShowReplies ? (
                <>
                  {visibleReplies.map(renderReply)}
                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    {page > 1 && (
                      <TouchableOpacity onPress={() => setReplyPages(p => ({ ...p, [item._id]: page - 1 }))}>
                        <Text style={{ color: '#1E3A8A', fontWeight: '500', marginRight: 16 }}>Prev</Text>
                      </TouchableOpacity>
                    )}
                    {endIdx < replyCount && (
                      <TouchableOpacity onPress={() => setReplyPages(p => ({ ...p, [item._id]: page + 1 }))}>
                        <Text style={{ color: '#1E3A8A', fontWeight: '500', marginRight: 16 }}>View more</Text>
                      </TouchableOpacity>
                    )}
                    {shouldShowReplies && (
                      <TouchableOpacity onPress={() => {
                        setShowReplies(r => ({ ...r, [item._id]: false }));
                        setReplyPages(p => ({ ...p, [item._id]: 1 }));
                      }}>
                        <Text style={{ color: '#e11d48', fontWeight: '500' }}>Hide replies</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              ) : (
                <TouchableOpacity onPress={() => setShowReplies(r => ({ ...r, [item._id]: true }))}>
                  <Text style={{ color: '#1E3A8A', fontWeight: '500', marginTop: 2 }}>
                    View {replyCount} repl{replyCount === 1 ? 'y' : 'ies'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const handleSend = () => {
    if (!input.trim() || sending) return;
    Keyboard.dismiss();
    setSending(true);
    // Clear replyTo before fetching comments to avoid double render
    const currentReplyTo = replyTo;
    const currentReplyToReplyId = replyToReplyId;
    setReplyTo(null);
    setReplyToReplyId(null);
    setReplyToUsername('');
    let postAction;
    if (currentReplyTo && currentReplyToReplyId) {
      postAction = addReplyToComment(postId, currentReplyTo, {
        content: input.trim(),
        replyToReplyId: currentReplyToReplyId
      });
    } else if (currentReplyTo) {
      postAction = addReplyToComment(postId, currentReplyTo, input.trim());
    } else {
      postAction = addCommentToPost(postId, input.trim());
    }
    postAction
      .then((updatedPost) => {
        // If backend returns updated post/comments, update UI immediately
        if (updatedPost && updatedPost.comments) {
          // Sort comments by createdAt descending so newest is at the top
          const sortedComments = Array.isArray(updatedPost.comments)
            ? updatedPost.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : [];
          setComments(sortedComments);
        } else {
          // Fallback: fetch comments
          return getPostComments(postId).then(fetchedComments => {
            const sortedComments = Array.isArray(fetchedComments)
              ? fetchedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              : [];
            setComments(sortedComments);
          });
        }
        setShowReplies({});
      })
      .catch(() => {})
      .finally(() => {
        setInput('');
        setSending(false);
      });
  };
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showReplies, setShowReplies] = useState({}); // { [commentId]: true/false }
  const inputRef = useRef();

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    getPostComments(postId)
      .then(comments => {
        setComments(Array.isArray(comments) ? comments : []);
      })
      .catch((err) => {
        setComments([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [visible, postId]);

  // Update formatRelativeTime to remove 'ago' and format with dot separator
  function formatRelativeTime(date) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 1) {
      if (diffHour < 1) {
        if (diffMin < 1) return 'just now';
        return `${diffMin} min`;
      }
      return `${diffHour} hour${diffHour > 1 ? 's' : ''}`;
    }
    if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''}`;
    }
    const diffWeek = Math.floor(diffDay / 7);
    if (diffWeek < 5) {
      return `${diffWeek} week${diffWeek > 1 ? 's' : ''}`;
    }
    const diffMonth = Math.floor(diffDay / 30.44);
    if (diffMonth < 12) {
      return `${diffMonth} month${diffMonth > 1 ? 's' : ''}`;
    }
    const diffYear = Math.floor(diffDay / 365.25);
    return `${diffYear} year${diffYear > 1 ? 's' : ''}`;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modal}>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={replyTo ? 'Reply to comment...' : 'Add a comment...'}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendBtn} disabled={sending || !input.trim()}>
              <Feather name="send" size={20} color={sending || !input.trim() ? '#aaa' : '#fff'} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.commentsList}>
              {[...Array(3)].map((_, idx) => (
                <View key={idx} style={styles.commentRow}>
                  <View style={[styles.avatar, { backgroundColor: '#eee' }]} />
                  <View style={styles.commentContentFlat}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 80, height: 16, backgroundColor: '#eee', borderRadius: 4, marginBottom: 6 }} />
                    </View>
                    <View style={{ width: '90%', height: 14, backgroundColor: '#eee', borderRadius: 4, marginBottom: 8 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <View style={{ width: 32, height: 14, backgroundColor: '#eee', borderRadius: 4, marginRight: 12 }} />
                      <View style={{ width: 32, height: 14, backgroundColor: '#eee', borderRadius: 4 }} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : comments.length === 0 ? (
            <Text style={styles.empty}>No comments yet.</Text>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={item => item._id}
              renderItem={renderComment}
              contentContainerStyle={styles.commentsList}
              showsVerticalScrollIndicator={false}
              extraData={showReplies}
            />
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 0,
    width: '100%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    width: '100%',
    backgroundColor: '#f9fafb',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222',
  },
  sendBtn: {
    marginLeft: 8,
  backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: 8,
  },
  commentsList: {
    padding: 16,
    width: '100%',
    alignItems: 'flex-start',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    width: '100%',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  commentContentFlat: {
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  commentActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
    gap: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  username: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
    marginRight: 8,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  likeCount: {
    color: '#e11d48',
    fontWeight: '600',
    marginLeft: 2,
    fontSize: 14,
  },
  replyLink: {
  color: '#1E3A8A',
    fontWeight: '500',
    fontSize: 14,
  },
  commentText: {
    color: '#222',
    fontSize: 15,
    marginTop: 2,
  },
  repliesBox: {
    marginTop: 8,
    marginLeft: 8,
    borderLeftWidth: 2,
    borderColor: '#e5e7eb',
    paddingLeft: 8,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    width: '100%',
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  replyContentBox: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 7,
  },
  replyUsername: {
    fontWeight: 'bold',
  color: '#1E3A8A',
    fontSize: 14,
    marginBottom: 2,
  },
  replyText: {
    color: '#222',
    fontSize: 14,
  },
  empty: {
    color: '#888',
    marginTop: 32,
    alignSelf: 'center',
  },
  closeBtn: {
    marginTop: 10,
    marginBottom: 18,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    alignSelf: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  commentTime: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  replyTime: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  // Add dot style to PostComments styles
  dot: {
    fontSize: 16,
    color: '#888',
    marginLeft: 6,
    marginRight: 4,
    fontWeight: 'bold',
  },
});
