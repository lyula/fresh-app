import React from 'react';
import { useSidebar } from '../context/SidebarContext';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../context/user';

const LOGO = require('../assets/icon.png');
const GOLD = '#a99d6b';
const ICON_COLOR = '#1E3A8A';


import { useNavigation } from '@react-navigation/native';

export default function MainHeader({ title = 'Vibe', onCommunity, onMessages, onNotifications, onProfile }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { toggleSidebar } = useSidebar();
  const { user: profile } = useUser();
  // Get profile image (same logic as Sidebar)
  let profileImage = null;
  if (profile) {
    if (profile.profile && (profile.profile.profileImage || profile.profile.avatar)) {
      profileImage = profile.profile.profileImage || profile.profile.avatar;
    } else if (profile.profileImage || profile.avatar) {
      profileImage = profile.profileImage || profile.avatar;
    }
  }
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>  
      <TouchableOpacity style={styles.iconButton} onPress={toggleSidebar}>
        <Icon name="bars" size={30} color={ICON_COLOR} />
      </TouchableOpacity>
      <View style={styles.centerContainer}>
        <Text style={[styles.title, { color: ICON_COLOR }]}>{title}</Text>
      </View>
      <View style={styles.rightContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={onCommunity || (() => navigation.navigate('PostsFeed'))}>
          <FA5Icon name="users" size={20} color={ICON_COLOR} solid />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onMessages || (() => navigation.navigate('MessagesScreen'))}>
          <Ionicons name="chatbox" size={22} color={ICON_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onNotifications || (() => navigation.navigate('NotificationsScreen'))}>
          <Icon name="bell" size={20} color={ICON_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onProfile}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
              accessibilityLabel="Profile picture"
            />
          ) : (
            <Icon name="user-circle" size={22} color={ICON_COLOR} />
          )}
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 8,
    minHeight: 56,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: ICON_COLOR,
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    resizeMode: 'cover',
  },
});
