import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MainHeader from '../components/MainHeader';
import FeedHeader from '../components/FeedHeader';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import AdCard from '../components/AdCard';

// This screen expects posts and ads to be provided as props or from a parent context
// It does not manage pagination or fetching logic internally
export default function PostsFeedScreen({ posts = [], ads = [], navigation }) {
  const [activeTab, setActiveTab] = useState('forYou');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // RenderItem logic: after every 4th post (after the 3rd), insert an ad from ads array, cycling through ads
  const renderItem = ({ item, index }) => {
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
  };

  return (
    <View style={{ flex: 1 }}>
  <MainHeader onMenu={() => setSidebarVisible(!sidebarVisible)} />
      <FeedHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <FlatList
        data={posts}
        keyExtractor={(item, idx) => String(item.id || item._id || idx)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} navigation={navigation} />
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
