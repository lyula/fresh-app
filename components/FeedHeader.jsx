import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const GOLD = '#a99d6b';
const GRAY = '#6b7280';

export default function FeedHeader({ activeTab, setActiveTab, onSearch, onCreatePost }) {
  return (
    <View style={styles.container}>  
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('forYou')}
        >
          <Text style={[styles.tabText, activeTab === 'forYou' && styles.tabTextActive]}>For you</Text>
          {activeTab === 'forYou' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>Following</Text>
          {activeTab === 'following' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
        <Icon name="search" size={16} color={GRAY} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.createButton} onPress={onCreatePost}>
        <Icon name="plus" size={12} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.createButtonText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16, // add more left/right padding
    paddingBottom: 0,
    minHeight: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tabButton: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY,
    paddingVertical: 5,
  },
  tabTextActive: {
    color: GOLD,
  },
  tabUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: GOLD,
    borderRadius: 1,
  },
  searchButton: {
    padding: 5,
    marginRight: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
