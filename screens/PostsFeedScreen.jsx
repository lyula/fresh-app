import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import MainHeader from '../components/MainHeader';
import FeedHeader from '../components/FeedHeader';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { dummyUser } from '../components/SidebarTrigger';

// Dummy data for posts
const posts = [
  {
    id: '1',
    user: {
      name: 'Jane Doe',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    },
    content: 'Excited to join Journalyze! #firstpost',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    likes: 12,
    comments: 3,
    createdAt: '2h ago',
  },
  {
    id: '2',
    user: {
      name: 'John Smith',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
    content: 'Loving the new features!',
    image: '',
    likes: 8,
    comments: 1,
    createdAt: '1h ago',
  },
  // ...more posts
];

export default function PostsFeedScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('forYou');
  const [sidebarVisible, setSidebarVisible] = useState(false);

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
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  feedContent: {
    padding: 12,
    paddingBottom: 32,
  },
});
