import React, { useRef, useEffect, useState } from 'react';
import { useSidebar } from '../context/SidebarContext';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Dimensions, ScrollView, Image, PanResponder } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
const VERIFIED_BADGE = require('../assets/blue-badge.png');
import { useUser } from '../context/user';

const GOLD = '#a99d6b';
const BLUE = '#1E3A8A';
const BG = '#f5f7fa';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  bgTouchable: {
    flex: 1,
  },
  sidebar: {
    height: '100%',
    backgroundColor: BG,
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 18,
    alignItems: 'flex-start',
    minHeight: '100%',
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    justifyContent: 'center',
  },
  brandLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    letterSpacing: 1.2,
    marginBottom: 2,
    marginTop: 2,
    textAlign: 'center',
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BLUE,
    marginBottom: 2,
    maxWidth: 180,
    textAlign: 'center',
  },
  hr: {
    width: '80%',
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
    alignSelf: 'center',
  },
  updateProfileBtn: {
    marginBottom: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  updateProfileText: {
    color: BLUE,
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  email: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
    maxWidth: 180,
    textAlign: 'center',
  },
  menuContainer: {
    width: '100%',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // increased for better spacing
    width: '100%',
    borderRadius: 10,
    paddingHorizontal: 2,
    marginBottom: 0,
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 18,
    color: BLUE,
    fontWeight: '700',
    marginLeft: 16,
    textAlign: 'left',
    letterSpacing: 0.2,
  },
  logoutContainer: {
    width: '100%',
    paddingBottom: 18,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  logoutBtn: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  logoutText: {
    color: GOLD,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default function Sidebar() {
  const { visible, closeSidebar, handleNavigate } = useSidebar();
  const { user: profile, loadingUser: loading, setUser } = useUser();
  const dashboardLinks = [
    { label: 'Dashboard', icon: <MaterialCommunityIcons name="view-dashboard-outline" size={24} color={GOLD} />, route: 'Dashboard' },
    { label: 'Analytics', icon: <MaterialCommunityIcons name="chart-bar" size={24} color={GOLD} />, route: 'Analytics' },
    { label: 'Vibe', icon: <MaterialCommunityIcons name="account-group" size={24} color={GOLD} />, route: 'Vibe' },
    { label: 'Inbox', icon: <Feather name="inbox" size={24} color={GOLD} />, route: 'Inbox' },
    { label: 'Ads Service', icon: <MaterialCommunityIcons name="storefront-outline" size={24} color={GOLD} />, route: 'AdsService' },
    { label: 'Signal Rooms', icon: <MaterialCommunityIcons name="bullhorn" size={24} color={GOLD} />, route: 'SignalRooms' },
  { label: 'Payments', icon: <FontAwesome5 name="money-check-alt" size={20} color={GOLD} />, route: 'PaymentsScreen' },
    { label: 'Settings', icon: <Feather name="settings" size={24} color={GOLD} />, route: 'Settings' },
  ];

  const screenWidth = Dimensions.get('window').width;
  const sidebarWidth = screenWidth * 0.55;
  const slideAnim = useRef(new Animated.Value(-sidebarWidth)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) {
          slideAnim.setValue(Math.max(gestureState.dx, -sidebarWidth));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -sidebarWidth / 6) {
          Animated.timing(slideAnim, {
            toValue: -sidebarWidth,
            duration: 160,
            useNativeDriver: false,
          }).start(() => closeSidebar());
        } else {
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 160,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -sidebarWidth,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, sidebarWidth]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={closeSidebar}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.bgTouchable} activeOpacity={1} onPress={closeSidebar} />
        <Animated.View
          style={[styles.sidebar, { width: sidebarWidth, left: slideAnim }]}
          {...panResponder.panHandlers}
        >
          <View style={{ flex: 1, height: '100%' }}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* User section */}
              <View style={styles.userSection}>
                {loading ? (
                  <Text>Loading...</Text>
                ) : profile ? (
                  <>
                    <View style={styles.avatarCircle}>
                      {profile.profile && (profile.profile.profileImage || profile.profile.avatar) ? (
                        <Image
                          source={{ uri: profile.profile.profileImage || profile.profile.avatar }}
                          style={{ width: 64, height: 64, borderRadius: 32, resizeMode: 'cover' }}
                          accessibilityLabel="Profile picture"
                        />
                      ) : profile.profileImage || profile.avatar ? (
                        <Image
                          source={{ uri: profile.profileImage || profile.avatar }}
                          style={{ width: 64, height: 64, borderRadius: 32, resizeMode: 'cover' }}
                          accessibilityLabel="Profile picture"
                        />
                      ) : profile.username ? (
                        <Image
                          source={{ uri: `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(profile.username)}` }}
                          style={{ width: 64, height: 64, borderRadius: 32, resizeMode: 'cover' }}
                          accessibilityLabel="Profile initials avatar"
                        />
                      ) : (
                        <Feather name="user" size={40} color={BLUE} />
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <Text style={styles.username} numberOfLines={1}>{profile.username || 'User'}</Text>
                      {profile.verified && (
                        <Image
                          source={VERIFIED_BADGE}
                          style={{ width: 18, height: 18, marginLeft: 4 }}
                          resizeMode="contain"
                          accessibilityLabel="Verified badge"
                        />
                      )}
                    </View>
                    {profile.email && (
                      <Text style={styles.email} numberOfLines={1}>{profile.email}</Text>
                    )}
                    <View style={styles.hr} />
                  </>
                ) : null}
              </View>
              {/* Links */}
              <View style={styles.menuContainer}>
                {dashboardLinks.map(link => (
                  <TouchableOpacity
                    key={link.label}
                    style={styles.menuItem}
                    onPress={() => { handleNavigate(link.route); }}
                    accessibilityLabel={link.label}
                  >
                    <View style={styles.iconLabelRow}>
                      {link.icon}
                      <Text style={styles.menuLabel}>{link.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ height: 80 }} />
            </ScrollView>
            <View style={styles.logoutContainer}>
              <View style={styles.hr} />
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => handleNavigate('Login')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="log-out" size={22} color={GOLD} style={{ marginRight: 10 }} />
                  <Text style={styles.logoutText}>Logout</Text>
                </View>
              </TouchableOpacity>
            </View>
            {/* Spacer to fill remaining space and allow drag */}
            <View style={{ flex: 1 }} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}
