import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MainHeader from '../components/MainHeader';
import FeedHeader from '../components/FeedHeader';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';

import { fetchPosts } from '../utils/api';
import { fetchAds } from '../utils/ads';
import { interleaveAds } from '../utils/interleaveAds';
import AdCard from '../components/AdCard';


export default function PostsFeedScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('forYou');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);


  const [ads, setAds] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchInitialPosts({ isInitial: true });
    return () => { isMounted = false; };
    // eslint-disable-next-line
  }, []);

  const fetchInitialPosts = async ({ isInitial = false } = {}) => {
    if (isInitial) setLoading(true);
    try {
      const [posts, fetchedAds] = await Promise.all([
        fetchPosts({ page: 1, limit: 10 }),
        fetchAds()
      ]);
      const adsArray = Array.isArray(fetchedAds) ? fetchedAds : (fetchedAds.ads || []);
      console.log('Fetched ads:', adsArray);
      // Add a dummy ad for testing
      const dummyAd = {
        _id: 'dummy-ad-1',
        title: 'Test Ad Title',
        description: 'This is a test ad description.',
        image: 'https://via.placeholder.com/400x200.png?text=Test+Ad',
        userId: {
          username: 'adtester',
          profileImage: 'https://via.placeholder.com/100x100.png?text=User',
          verified: true
        }
      };
      const adsWithDummy = [...adsArray, dummyAd];
      setAds(adsWithDummy);
      const feedData = interleaveAdsWithKeys(posts, adsWithDummy, 0);
      setFeed(feedData);
      setPage(2);
      setHasMore(posts.length === 10);
    } catch (err) {
      setError('Failed to load feed');
      console.error('Error fetching posts or ads:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Helper to interleave ads with unique keys
  function interleaveAdsWithKeys(posts, ads, pageOffset = 0) {
    if (!ads || !ads.length) return posts;
    const result = [];
    let adIdx = 0;
    for (let i = 0; i < posts.length; i++) {
      result.push(posts[i]);
      if ((i + 1) % 4 === 0 && i > 2) {
        const ad = { ...ads[adIdx % ads.length], _isAd: true, _adKey: `ad-${pageOffset}-${adIdx}` };
        result.push(ad);
        adIdx++;
      }
    }
    return result;
  }

  const fetchMorePosts = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const posts = await fetchPosts({ page, limit: 10 });
      if (posts.length > 0) {
        // Interleave ads into the new batch, offsetting ad keys by page
        const newFeed = interleaveAdsWithKeys(posts, ads, page);
        setFeed(prev => [...prev, ...newFeed]);
        setPage(prev => prev + 1);
        setHasMore(posts.length === 10);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchInitialPosts({ isInitial: false });
    } finally {
      setRefreshing(false);
    }
  };

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
          data={feed}
          keyExtractor={item => {
            if (item._isAd) {
              return item._adKey || `ad-${item._id || item.id || Math.random()}`;
            }
            return String(item.id || item._id || Math.random());
          }}
          renderItem={({ item }) =>
            item._isAd ? <AdCard ad={item} /> : <PostCard post={item} />
          }
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
          onEndReached={fetchMorePosts}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={refreshing ? (
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
