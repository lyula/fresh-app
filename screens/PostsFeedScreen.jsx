import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, Animated, RefreshControl } from 'react-native';
import MainHeader from '../components/MainHeader';
import FeedHeader from '../components/FeedHeader';
import PostCard from '../components/PostCard';
import AdCard from '../components/AdCard';
import ProfileSuggestions from '../components/ProfileSuggestions';
import { useUser } from '../context/user';
import BottomHeader from '../components/BottomHeader';
import { useNavigation } from '@react-navigation/native';
import { fetchPosts } from '../utils/api';
import { fetchAds } from '../utils/ads';

// This screen expects posts and ads to be provided as props or from a parent context
// It does not manage pagination or fetching logic internally

function PostsFeedScreen() {
  const navigation = useNavigation();
  // Get newPost from navigation params
  const newPost = navigation?.getState?.()?.routes?.find(r => r.name === 'PostsFeed')?.params?.newPost;
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('forYou');
  const panResponder = React.useRef(
    require('react-native').PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => (
        Math.abs(gestureState.dx) > 60 && Math.abs(gestureState.dx) > 2 * Math.abs(gestureState.dy)
      ),
      onPanResponderRelease: (evt, gestureState) => {
        setActiveTab(prevTab => {
          if (gestureState.dx < -80 && prevTab === 'forYou') return 'following';
          if (gestureState.dx > 80 && prevTab === 'following') return 'forYou';
          return prevTab;
        });
      },
    })
  ).current;
  const lastScrollY = useRef(0);
  const feedHeaderAnim = useRef(new Animated.Value(0)).current;
  const feedHeaderOpacity = useRef(new Animated.Value(1)).current;
  const FEED_HEADER_HEIGHT = 56;
  const feedRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cyclingInfo, setCyclingInfo] = useState(null);
  // ProfileSuggestions intervals logic
  const [suggestionIntervals, setSuggestionIntervals] = useState([]);
  useEffect(() => {
    const postCount = posts.length;
    if (postCount < 2) {
      setSuggestionIntervals([]);
      return;
    }
    // Regenerate intervals every time posts change (refresh or pagination)
    const first = Math.floor(postCount / 3);
    const second = Math.floor((2 * postCount) / 3);
    const intervals = Array.from(new Set([first, second])).filter(i => i > 0 && i < postCount);
    setSuggestionIntervals(intervals);
  }, [posts]);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      fetchPosts({ offset: 0, limit: 20 }),
      fetchAds()
    ]).then(([postsResult, adsData]) => {
      if (!isMounted) return;
      // postsResult may be an object with posts, hasMore, cyclingInfo
      let postsArr = postsResult;
      let hasMoreVal = true;
      let cycling = null;
      if (postsResult && typeof postsResult === 'object' && Array.isArray(postsResult.posts)) {
        postsArr = postsResult.posts;
        hasMoreVal = postsResult.hasMore !== false;
        cycling = postsResult.cyclingInfo || null;
      }
      // Prepend newPost if present
      if (newPost && newPost._id) {
        postsArr = [newPost, ...postsArr.filter(p => p._id !== newPost._id)];
      }
      // Sort posts by createdAt descending
      postsArr = postsArr.filter(p => p.createdAt).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(postsArr || []);
      setAds(Array.isArray(adsData) ? adsData : (adsData.ads || []));
      setOffset(postsArr.length);
      setHasMore(hasMoreVal);
      setCyclingInfo(cycling);
      setLoading(false);
    }).catch(err => {
      if (!isMounted) return;
      setError('Failed to load feed');
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [newPost]);

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [postsResult, adsData] = await Promise.all([
        fetchPosts({ offset: 0, limit: 20 }),
        fetchAds()
      ]);
      let postsArr = postsResult;
      let hasMoreVal = true;
      let cycling = null;
      if (postsResult && typeof postsResult === 'object' && Array.isArray(postsResult.posts)) {
        postsArr = postsResult.posts;
        hasMoreVal = postsResult.hasMore !== false;
        cycling = postsResult.cyclingInfo || null;
      }
      setPosts(postsArr || []);
      setAds(Array.isArray(adsData) ? adsData : (adsData.ads || []));
      setOffset(postsArr.length);
      setHasMore(hasMoreVal);
      setCyclingInfo(cycling);
    } catch (err) {
      setError('Failed to refresh feed');
    } finally {
      setRefreshing(false);
    }
  };

  // Infinite scroll
  const fetchMorePosts = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const postsResult = await fetchPosts({ offset, limit: 20 });
      let postsArr = postsResult;
      let hasMoreVal = true;
      let cycling = null;
      if (postsResult && typeof postsResult === 'object' && Array.isArray(postsResult.posts)) {
        postsArr = postsResult.posts;
        hasMoreVal = postsResult.hasMore !== false;
        cycling = postsResult.cyclingInfo || null;
      }
      if (postsArr && postsArr.length > 0) {
        // Only increment offset by the number of real posts (not ads)
        const newPosts = postsArr.filter(p => !p._isAd && (p.id || p._id));
        setPosts(prev => [...prev, ...newPosts]);
        setOffset(prev => prev + newPosts.length);
        setCyclingInfo(cycling);
        setHasMore(hasMoreVal);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setIsFetchingMore(false);
    }
  };

  // RenderItem logic: after every 4th post (after the 3rd), insert an ad from ads array, cycling through ads
  // Insert ProfileSuggestions after the 5th post (index 4), matching client logic
  const renderItem = ({ item, index }) => {
    const adInterval = 4;
    const adStart = 3;
    const shouldShowAd = (index + 1) % adInterval === 0 && index > adStart - 1 && ads.length > 0;
    const adInsertionCount = Math.floor((index + 1 - adStart) / adInterval);
    const adIndex = ads.length > 0 ? adInsertionCount % ads.length : 0;
    // Show ProfileSuggestions at each interval
    const shouldShowSuggestions = suggestionIntervals.includes(index + 1);
    return (
      <>
        <PostCard post={item} />
        {shouldShowSuggestions && (
          <ProfileSuggestions currentUser={user} />
        )}
        {shouldShowAd && ads.length > 0 && (
          <AdCard ad={ads[adIndex]} />
        )}
      </>
    );
  };

  return (
  <View style={{ flex: 1, paddingTop: 56 }} {...panResponder.panHandlers}>
      {/* MainHeader absolutely at the top, always above FeedHeader */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
        <MainHeader onMessages={() => navigation.navigate('MessagesScreen')} />
      </View>
      {/* FeedHeader absolutely below MainHeader, animates under it */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 56, // height of MainHeader
          left: 0,
          right: 0,
          // Removed marginTop to eliminate gap
          transform: [{ translateY: feedHeaderAnim }],
          opacity: feedHeaderOpacity,
          zIndex: 10,
        }}
        pointerEvents="box-none"
      >
        <FeedHeader

          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCreatePost={() => navigation.navigate('CreatePost')}
        />
      </Animated.View>
      {/* Feed content starts below both headers */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120 }}>
          <ActivityIndicator size="large" color="#a99d6b" />
          <Text style={{ marginTop: 12, color: '#888' }}>Loading feed...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120 }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          ref={feedRef}
          data={posts}
          keyExtractor={(item, idx) => String(item.id || item._id || idx)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 32, paddingBottom: 70 }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={fetchMorePosts}
          onEndReachedThreshold={0.5}
          onScroll={event => {
            const currentY = event.nativeEvent.contentOffset.y;
            if (currentY > lastScrollY.current + 10) {
              Animated.parallel([
                Animated.timing(feedHeaderAnim, {
                  toValue: -FEED_HEADER_HEIGHT,
                  duration: 220,
                  useNativeDriver: true,
                }),
                Animated.timing(feedHeaderOpacity, {
                  toValue: 0,
                  duration: 220,
                  useNativeDriver: true,
                })
              ]).start();
            } else if (currentY < lastScrollY.current - 10) {
              Animated.parallel([
                Animated.timing(feedHeaderAnim, {
                  toValue: 0,
                  duration: 220,
                  useNativeDriver: true,
                }),
                Animated.timing(feedHeaderOpacity, {
                  toValue: 1,
                  duration: 220,
                  useNativeDriver: true,
                })
              ]).start();
            }
            lastScrollY.current = currentY;
          }}
          scrollEventThrottle={16}
          ListFooterComponent={isFetchingMore ? (
            <View style={{ padding: 16, alignItems: 'center', marginBottom: 0 }}>
              <ActivityIndicator size="small" color="#a99d6b" />
              <Text style={{ color: '#888', marginTop: 6 }}>Loading more...</Text>
            </View>
          ) : null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              progressViewOffset={FEED_HEADER_HEIGHT + 10}
              colors={["#1E3A8A"]}
              tintColor="#1E3A8A"
            />
          }
        />
      )}

      {/* Sticky bottom bar with icons, only visible when FeedHeader is hidden */}
      <Animated.View
        pointerEvents="box-none"
        style={{
          opacity: feedHeaderOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        }}
      >
        <BottomHeader
          onHomePress={() => {
            if (feedRef.current) {
              feedRef.current.scrollToOffset({ offset: 0, animated: true });
            }
          }}
          onDiscoverPress={() => navigation.navigate('AllProfileSuggestions')}
          onMessagesPress={() => {}}
          onPlusPress={() => navigation.navigate('CreatePost')}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  feedContent: {
    paddingTop: 0,
    paddingHorizontal: 5,
    paddingBottom: 32,
  },
});

export default PostsFeedScreen;
