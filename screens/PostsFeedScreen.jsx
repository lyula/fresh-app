import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([fetchPosts(), fetchAds()])
      .then(([posts, ads]) => {
        if (!isMounted) return;
        const feedData = interleaveAds(posts, ads);
        setFeed(feedData);
      })
      .catch(err => {
        if (!isMounted) return;
        setError('Failed to load feed');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

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
