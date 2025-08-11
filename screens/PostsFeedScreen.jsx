import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MainHeader from '../components/MainHeader';
import FeedHeader from '../components/FeedHeader';
import PostCard from '../components/PostCard';
import AdCard from '../components/AdCard';
import { fetchPosts } from '../utils/api';
import { fetchAds } from '../utils/ads';

// This screen expects posts and ads to be provided as props or from a parent context
// It does not manage pagination or fetching logic internally
export default function PostsFeedScreen() {
  const [activeTab, setActiveTab] = useState('forYou');
  const [posts, setPosts] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cyclingInfo, setCyclingInfo] = useState(null);

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
  }, []);

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
  const renderItem = ({ item, index }) => {
    const adInterval = 4;
    const adStart = 3;
    const shouldShowAd = (index + 1) % adInterval === 0 && index > adStart - 1 && ads.length > 0;
    // Always recycle ads: cycle through ads array as many times as needed
    const adInsertionCount = Math.floor((index + 1 - adStart) / adInterval);
    const adIndex = ads.length > 0 ? adInsertionCount % ads.length : 0;
    return (
      <>
        <PostCard post={item} />
        {shouldShowAd && ads.length > 0 && (
          <AdCard ad={ads[adIndex]} />
        )}
      </>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#a99d6b" />
        <Text style={{ marginTop: 12, color: '#888' }}>Loading feed...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <MainHeader />
      <FeedHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <FlatList
        data={posts}
        keyExtractor={(item, idx) => String(item.id || item._id || idx)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={fetchMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingMore ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#a99d6b" />
            <Text style={{ color: '#888', marginTop: 6 }}>Loading more...</Text>
          </View>
        ) : null}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <MainHeader
        onMenu={() => setSidebarVisible(true)}
        onCommunity={() => {}}
        onMessages={() => {}}
        onNotifications={() => {}}
        onProfile={() => {}}
      />
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onNavigate={route => {
          setSidebarVisible(false);
          if (route === 'Login') {
            navigation.replace('Login');
          }
        }}
      />
      <FeedHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearch={() => {}}
        onCreatePost={() => {}}
      />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#888' }}>Loading feed...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, idx) => String(item.id || item._id || idx)}
          renderItem={({ item, index }) => {
            // Insert ad every 4th post after the 3rd
            const adInterval = 4;
            const adStart = 3;
            const shouldShowAd = (index + 1) % adInterval === 0 && index > adStart - 1 && ads.length > 0;
            const adInsertionCount = Math.floor((index + 1 - adStart) / adInterval);
            const adIndex = adInsertionCount % ads.length;
            return (
              <>
                <PostCard post={item} />
                {shouldShowAd && (
                  <AdCard ad={ads[adIndex]} />
                )}
              </>
            );
          }}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
          onEndReached={fetchMorePosts}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={(!loading && refreshing) ? (
            <View style={{ alignItems: 'center', padding: 12 }}>
              <ActivityIndicator size="small" color="#888" />
            </View>
          ) : null}
          ListFooterComponent={isFetchingMore ? (
            <View style={{ alignItems: 'center', padding: 16 }}>
              <ActivityIndicator size="small" color="#888" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#888' }}>Loading more...</Text>
            </View>
          ) : null}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
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
