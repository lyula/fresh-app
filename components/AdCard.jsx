
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import PostsInteractionBar from './PostsInteractionBar';
import { getAdInteractions, likeAd, viewAd } from '../utils/adInteractionsApi';
import { useUser } from '../context/user';

const AVATAR_SIZE = 38;

export default function AdCard({ ad, onView, onClick }) {
  const { userId } = useUser();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(ad.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(ad.commentsCount || 0);
  const [views, setViews] = useState(ad.views || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const hasTrackedImpression = useRef(false);

  // Fetch ad interaction state on mount
  useEffect(() => {
    let isMounted = true;
    if (!ad || !ad._id) return;
    getAdInteractions(ad._id)
      .then(data => {
        if (!isMounted) return;
        const likesArr = Array.isArray(data?.likes) ? data.likes : [];
        setLiked(!!likesArr.find(u => String(u?._id) === String(userId)));
        setLikesCount(likesArr.length);
        setCommentsCount(Array.isArray(data?.comments) ? data.comments.length : 0);
        setViews(typeof data?.viewCount === 'number' ? data.viewCount : 0);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [ad?._id, userId]);

  // Track ad view (impression) once
  useEffect(() => {
    if (!ad || !ad._id || hasTrackedImpression.current) return;
    viewAd(ad._id).then(data => {
      setViews(typeof data?.viewCount === 'number' ? data.viewCount : v => v);
      hasTrackedImpression.current = true;
    }).catch(() => {});
  }, [ad?._id]);

  const handleLike = async () => {
    if (!ad || !ad._id || likeLoading) return;
    setLikeLoading(true);
    try {
      await likeAd(ad._id);
      // Always fetch the latest state from the DB after like
      const data = await getAdInteractions(ad._id);
      const likesArr = Array.isArray(data?.likes) ? data.likes : [];
      setLiked(!!likesArr.find(u => String(u?._id) === String(userId)));
      setLikesCount(likesArr.length);
      setCommentsCount(Array.isArray(data?.comments) ? data.comments.length : 0);
      setViews(typeof data?.viewCount === 'number' ? data.viewCount : 0);
    } catch {}
    setLikeLoading(false);
  };
  // const hasTrackedImpression = useRef(false);
  // useEffect(() => {
  //   if (!ad || hasTrackedImpression.current) return;
  //   if (onView) onView();
  //   viewAd(ad._id);
  //   hasTrackedImpression.current = true;
  // }, [ad, onView]);

  const author = ad.userId || ad.user || {};
  const profileImage = author.profileImage || (author.profile && author.profile.profileImage);
  const username = author.username || 'Unknown';
  const isVerified = author.verified || (author.profile && author.profile.verified);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.93}
      onPress={() => {
        if (onClick) onClick();
      }}
    >
      {/* Author row */}
      <View style={styles.headerRow}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}> 
            <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 20 }}>
              {username[0] ? username[0].toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <View style={styles.headerTextCol}>
          <View style={styles.authorBadgeRow}>
            <Text style={styles.author}>{username}</Text>
            {isVerified && (
              <Image source={require('../assets/blue-badge.png')} style={styles.badge} />
            )}
          </View>
          <Text style={styles.sponsored}>Sponsored</Text>
        </View>
        <View style={styles.adBanner}>
          <Text style={styles.adBannerText}>AD</Text>
        </View>
      </View>
      {ad.image && (
        <View style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 0 }}>
          <Image source={{ uri: ad.image }} style={styles.image} resizeMode="cover" />
        </View>
      )}
      <Text style={styles.title}>{ad.title}</Text>
      <Text style={styles.desc}>{ad.description}</Text>

      {/* Ad Action Button (styled) */}
      {(() => {
        const contactMethod = ad.contactMethod || '';
        const linkUrl = ad.linkUrl || '';
        const whatsappNumber = ad.whatsappNumber || '';
        if (contactMethod === 'link' && linkUrl) {
          return (
            <TouchableOpacity
              style={[styles.adButton, { backgroundColor: '#1E3A8A' }]}
              activeOpacity={0.88}
              onPress={() => {
                if (linkUrl) {
                  // Open link in browser
                  if (typeof window !== 'undefined') {
                    window.open(linkUrl, '_blank');
                  } else {
                    // For React Native, use Linking
                    try {
                      const Linking = require('react-native').Linking;
                      Linking.openURL(linkUrl);
                    } catch {}
                  }
                }
              }}
            >
              <Text style={styles.adButtonText}>Visit Link</Text>
            </TouchableOpacity>
          );
        }
        if (contactMethod === 'whatsapp' && whatsappNumber) {
          return (
            <TouchableOpacity
              style={[styles.adButton, { backgroundColor: '#25D366' }]}
              activeOpacity={0.88}
              onPress={() => {
                const url = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}`;
                try {
                  const Linking = require('react-native').Linking;
                  Linking.openURL(url);
                } catch {}
              }}
            >
              <Text style={styles.adButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          );
        }
        if (contactMethod === 'direct-message') {
          return (
            <TouchableOpacity
              style={[styles.adButton, { backgroundColor: '#7c3aed' }]}
              activeOpacity={0.88}
              onPress={() => {
                // Implement navigation to chat screen if needed
              }}
            >
              <Text style={styles.adButtonText}>Send Direct Message</Text>
            </TouchableOpacity>
          );
        }
        return null;
      })()}

      <View style={{ paddingBottom: 16 }}>
        <PostsInteractionBar
          likes={likesCount}
          comments={commentsCount}
          shareCount={ad.shares || 0}
          views={views}
          likedBy={[]} // Not used for ads, disables local like state logic
          postId={ad._id}
          liked={liked}
          onLike={handleLike}
          onComment={() => {}}
          onShare={() => {}}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  adButton: {
    width: '100%',
    marginTop: 8,
    marginBottom: 6,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  adButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: '#fff', // Match normal post background
    borderRadius: 0,
    marginVertical: 0,
    marginHorizontal: 0,
    width: '100%',
    paddingVertical: 0,
    paddingHorizontal: 16, // Increased horizontal padding
    shadowColor: 'transparent',
    elevation: 0,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    borderColor: 'transparent',
    alignSelf: 'stretch',
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 0,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  adBanner: {
    marginLeft: 8,
    backgroundColor: '#ffe066',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
    minWidth: 36,
  },
  adBannerText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'center',
  },
  headerTextCol: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  authorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  author: {
    fontSize: 14,
    color: '#555',
    fontWeight: 'bold',
    paddingHorizontal: 0,
    paddingTop: 2,
    lineHeight: 18,
  },
  badge: {
    width: 20,
    height: 20,
    marginLeft: 4,
    marginTop: 1,
  },
  sponsored: {
    fontSize: 12,
    color: '#a99d6b',
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 0,
    lineHeight: 16,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 0,
    marginBottom: 0,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginTop: 10,
    marginBottom: 2,
    marginLeft: 0,
  },
  desc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    marginLeft: 0,
  },
});
