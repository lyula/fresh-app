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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchInitialPosts();
    return () => { isMounted = false; };
    // eslint-disable-next-line
  }, []);

  const fetchInitialPosts = async () => {
    try {
      const [posts, ads] = await Promise.all([
        fetchPosts({ page: 1, limit: 10 }),
        fetchAds()
      ]);
      const feedData = interleaveAds(posts, ads);
      setFeed(feedData);
      setPage(2);
      setHasMore(posts.length === 10);
    } catch (err) {
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const fetchMorePosts = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const posts = await fetchPosts({ page, limit: 10 });
      if (posts.length > 0) {
        setFeed(prev => [...prev, ...posts]);
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
          keyExtractor={item => String(item._isAd ? `ad-${item._id || item.id}` : item.id || item._id || Math.random())}
          renderItem={({ item }) =>
            item._isAd ? <AdCard ad={item} /> : <PostCard post={item} />
          }
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
          onEndReached={fetchMorePosts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingMore ? (
            <View style={{ alignItems: 'center', padding: 16 }}>
              <ActivityIndicator size="small" color="#888" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#888' }}>Loading more...</Text>
            </View>
          ) : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  feedContent: {
    padding: 5,
    paddingBottom: 32,
  },
});
