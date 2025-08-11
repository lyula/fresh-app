import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO = require('../assets/icon.png');
const GOLD = '#a99d6b';

export default function MainHeader({ onMenu, onCommunity, onMessages, onNotifications, onProfile }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>  
      <TouchableOpacity style={styles.iconButton} onPress={onMenu}>
        <Icon name="bars" size={30} color={GOLD} />
      </TouchableOpacity>
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Journalyze</Text>
      </View>
      <View style={styles.rightContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={onCommunity}>
          <FA5Icon name="users" size={20} color={GOLD} solid />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onMessages}>
          <Icon name="envelope" size={20} color={GOLD} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onNotifications}>
          <Icon name="bell" size={20} color={GOLD} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onProfile}>
          <Icon name="user-circle" size={22} color={GOLD} />
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
    color: GOLD,
    marginLeft: 8,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
