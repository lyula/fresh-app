
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import PostsInteractionBar from './PostsInteractionBar';

const AVATAR_SIZE = 38;

export default function AdCard({ ad, onView, onClick }) {
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
            {/* {isVerified && <BlueBadge style={styles.badge} />} */}
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
              style={[styles.adButton, { backgroundColor: '#a99d6b' }]}
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
          likes={ad.likes || 0}
          comments={ad.comments || 0}
          shareCount={ad.shares || 0}
          views={ad.views || 0}
          onLike={() => {}}
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
    paddingHorizontal: 5, // Reduced horizontal padding
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
    width: 18,
    height: 18,
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
