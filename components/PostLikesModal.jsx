import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Modal } from 'react-native';
import { getPostLikes } from '../utils/api';

export default function PostLikesModal({ visible, postId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [likers, setLikers] = useState([]);


  // Only fetch likers when modal is opened for a new postId, but do not clear on every open
  useEffect(() => {
    if (visible) {
      setLoading(true);
      getPostLikes(postId)
        .then(res => setLikers(res.likes || []))
        .catch(() => setLikers([]))
        .finally(() => setLoading(false));
    }
  }, [visible, postId]);

  // Clear likers only when modal is closed
  useEffect(() => {
    if (!visible) setLikers([]);
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Likes</Text>
          {loading ? (
            <ActivityIndicator size="large" style={{ marginTop: 32 }} />
          ) : likers.length === 0 ? (
            <Text style={styles.empty}>No users found.</Text>
          ) : (
            <FlatList
              data={likers}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.likerRow}>
                  {item.profile?.profileImage || item.profileImage ? (
                    <Image source={{ uri: item.profile?.profileImage || item.profileImage }} style={styles.avatarLarge} />
                  ) : (
                    <View style={styles.avatarPlaceholderLarge}>
                      <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                        style={styles.userIcon}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                  <Text style={styles.usernameLarge}>{item.username}</Text>
                  {item.verified && (
                    <Image source={{ uri: 'https://zack-lyula-portfolio.vercel.app/images/blue-badge.png' }} style={styles.badgeTight} />
                  )}
                </View>
              )}
            />
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
    width: '100%',
    maxHeight: '70%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 0,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  empty: {
    color: '#888',
    fontSize: 15,
    marginTop: 24,
  },
  resultsList: {
    alignItems: 'flex-start',
    width: '100%',
    paddingBottom: 16,
    paddingLeft: 0,
    paddingRight: 0,
  },
  likerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    width: 'auto',
    alignSelf: 'flex-start',
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#eee',
  },
  avatarPlaceholderLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userIcon: {
    width: 32,
    height: 32,
    tintColor: '#888',
    borderRadius: 0,
  },
  usernameLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginRight: 8,
  },
  badgeTight: {
    width: 20,
    height: 20,
    marginLeft: 2,
  },
  closeBtn: {
    marginTop: 18,
    backgroundColor: '#a99d6b',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
