import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet, Image as RNImage } from 'react-native';
import BlueBadge from '../components/BlueBadge';
import { useUser } from '../context/user';
import { getProfileSuggestions, browseUsers } from '../utils/api';
import { MaterialIcons, FontAwesome5, Feather, Ionicons } from '@expo/vector-icons';

function getProfileImage(user) {
  if (!user) return '';
  if (user.profile && typeof user.profile === 'object' && user.profile.profileImage) return user.profile.profileImage;
  if (user.profileImage) return user.profileImage;
  if (typeof user.profile === 'string') return user.profile;
  return '';
}

const FILTERS = [
  { key: 'recommended', label: 'Recommended', icon: <FontAwesome5 name="user-friends" size={16} color="#1E3A8A" /> },
  { key: 'most_followers', label: 'Popular', icon: <MaterialIcons name="stars" size={16} color="#a855f7" /> },
  { key: 'same_region', label: 'Your Region', icon: <Feather name="globe" size={16} color="#2563eb" /> },
  { key: 'recent', label: 'New Users', icon: <Ionicons name="person-add" size={16} color="#059669" /> },
];

export default function AllProfileSuggestionsScreen() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('recommended');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    // Only run one effect: if search is active, only show search results
    if (search.length > 0) {
      loadUsers(true, search, filter);
    } else {
      loadUsers(true, '', filter);
    }
  }, [currentUser, filter, search]);

  // Remove debounce effect, trigger loadUsers directly on search change
  useEffect(() => {
    if (!currentUser?._id) return;
    loadUsers(true);
  }, [search]);

  // Use browseUsers API for non-recommended filters

  const loadUsers = async (reset = false, newSearch = '', newFilter = '') => {
    // Always treat search as a new query (replace results)
    const currentPage = reset ? 1 : page;
    const searchVal = newSearch !== undefined ? newSearch : search;
    const filterVal = newFilter || filter;
    try {
      setLoading(true);
      setUsers([]);
      setPage(1);
      let response;
      if (filterVal === 'recommended') {
        // Use suggestions endpoint for recommended
        const data = await getProfileSuggestions(currentUser._id, 20, '', searchVal, 1);
        response = {
          users: data.suggestions || [],
          hasMore: (data.suggestions || []).length === 20,
          total: data.total || (data.suggestions ? data.suggestions.length : 0),
        };
      } else {
        // Use browseUsers API for other filters
        const data = await browseUsers({
          search: searchVal,
          filter: filterVal,
          page: 1,
          limit: 20,
        });
        response = {
          users: data.users || [],
          hasMore: (data.users || []).length === 20,
          total: data.total || (data.users ? data.users.length : 0),
        };
      }
      // Set isFollowing for each user based on currentUser.followingRaw
      const followingRaw = currentUser?.followingRaw || [];
      const usersWithFollow = (response.users || []).map(u => ({
        ...u,
        isFollowing: followingRaw.includes(u._id) || !!u.isFollowing,
      }));
      setUsers(usersWithFollow);
      setPage(2);
      setHasMore(response.hasMore || false);
    } catch {
      setUsers([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    loadUsers(true, search, newFilter); // Always fetch from database on filter change
  };

  const handleFollow = async (userId) => {
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, isFollowing: true } : u));
    // Optionally call API to follow user here
  };

  const renderReason = (user) => {
    if (filter === 'most_followers') return 'Popular user';
    if (filter === 'recommended') return 'Recommended for you';
    if (filter === 'same_region') return 'From your region';
    if (filter === 'recent') return 'New user';
    if (user.reason === 'mutual_following' && user.commonFollower) {
      return `Followed by ${user.commonFollower.username}`;
    }
    if (user.reason === 'same_country') return 'From your region';
    if (user.reason === 'most_followers') return 'Popular user';
    if (user.reason === 'recent') return 'New user';
    return 'Suggested for you';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
          <FontAwesome5 name="user-friends" size={22} color="#1E3A8A" style={{ marginRight: 8 }} />
          <Text style={styles.header}>Discover People</Text>
        </View>
        <Text style={styles.subHeader}>{users.length > 0 ? `${users.length} users found` : 'Find new people to follow'}</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterBar}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => handleFilterChange(f.key)}
          >
            {f.icon}
            <Text style={{ color: filter === f.key ? '#fff' : '#1E3A8A', fontWeight: 'bold', marginLeft: 6 }}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Feather name="search" size={18} color="#888" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username..."
            value={search}
            onChangeText={text => {
              setSearch(text);
              // Immediately trigger search
              loadUsers(true, text, filter);
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearch('');
              // After clearing, reload popular results
              loadUsers(true, '', filter);
            }}>
              <Ionicons name="close-circle" size={18} color="#888" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.skeletonGrid}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={styles.skeletonCard} />
          ))}
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <FontAwesome5 name="user-friends" size={36} color="#d1d5db" />
          </View>
          <Text style={styles.emptyText}>
            {search.length > 0
              ? `No users found matching "${search}"`
              : 'No users found'}
          </Text>
          <Text style={styles.emptySubText}>
            {search.length > 0
              ? 'Try a different search term.'
              : 'Try adjusting your filters to find more people.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item._id}
          numColumns={2}
          key={`users-grid-2`}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => {
            const isFollowing = (currentUser?.followingRaw || []).includes(item._id) || item.isFollowing;
            return (
              <View style={styles.card}>
                <View style={styles.avatarWrapper}>
                  {getProfileImage(item) ? (
                    <Image source={{ uri: getProfileImage(item) }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}> 
                      <FontAwesome5 name="user" size={32} color="#bbb" />
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, justifyContent: 'center' }}>
                  <Text style={styles.name} numberOfLines={1}>{item.username}</Text>
                  {item.verified && (
                    <RNImage
                      source={require('../assets/blue-badge.png')}
                      style={{ width: 18, height: 18, marginLeft: 4, marginBottom: -2 }}
                      resizeMode="contain"
                    />
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  {filter === 'most_followers' && (
                    <MaterialIcons name="stars" size={14} color="#a855f7" style={{ marginRight: 4 }} />
                  )}
                  {filter === 'recommended' && (
                    <FontAwesome5 name="user-friends" size={14} color="#1E3A8A" style={{ marginRight: 4 }} />
                  )}
                  {filter === 'same_region' && (
                    <Feather name="globe" size={14} color="#2563eb" style={{ marginRight: 4 }} />
                  )}
                  {filter === 'recent' && (
                    <Ionicons name="person-add" size={14} color="#059669" style={{ marginRight: 4 }} />
                  )}
                  <Text style={styles.suggestedText}>{renderReason(item)}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.followBtn, isFollowing && styles.followingBtn]}
                  onPress={() => handleFollow(item._id)}
                  disabled={isFollowing}
                >
                  <Text style={{ color: isFollowing ? '#1E3A8A' : '#fff', fontWeight: 'bold', fontSize: 13 }}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
          onEndReached={() => hasMore && !loadingMore && loadUsers(false)}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#1E3A8A" style={{ margin: 16 }} /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  headerWrap: {
    marginBottom: 8,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterBtnActive: {
    backgroundColor: '#1E3A8A',
  },
  searchBar: {
    marginBottom: 12,
    alignItems: 'center',
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '100%',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
    color: '#222',
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    flex: 1,
    marginHorizontal: 4,
  },
  avatarWrapper: {
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  suggestedText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  followBtn: {
    marginTop: 8,
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  followingBtn: {
    backgroundColor: '#e0f2fe',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  skeletonCard: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    width: '48%',
    height: 120,
    marginBottom: 8,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyIconWrap: {
    backgroundColor: '#f3f4f6',
    borderRadius: 32,
    padding: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
  },
});
