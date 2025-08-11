

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';

const LINK_COLOR = '#1E3A8A';
const GOLD = '#a99d6b';

// You can pass navigation or callback props as needed
export default function BottomHeader({ onHomePress, onDiscoverPress, onSettingsPress, onProfilePress, onMessagesPress = () => {}, onPlusPress = () => {} }) {
  return (
    <View style={styles.container}>
      {/* Home icon */}
      <TouchableOpacity onPress={onHomePress}>
        <MaterialIcons name="home" size={28} color={LINK_COLOR} />
      </TouchableOpacity>
      {/* Discover icon with user and plus */}
      <TouchableOpacity onPress={onDiscoverPress} style={styles.discoverContainer}>
        <Ionicons name="person" size={26} color={LINK_COLOR} />
        <Feather name="plus-circle" size={18} color={LINK_COLOR} style={styles.plusIcon} />
      </TouchableOpacity>
      {/* Plus icon in gold color */}
      <TouchableOpacity onPress={onPlusPress}>
        <Feather name="plus" size={28} color={GOLD} />
      </TouchableOpacity>
      {/* Search icon */}
      <TouchableOpacity onPress={onMessagesPress}>
        <Feather name="search" size={26} color={LINK_COLOR} />
      </TouchableOpacity>
      {/* Settings icon */}
      <TouchableOpacity onPress={onSettingsPress}>
        <Feather name="settings" size={26} color={LINK_COLOR} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 15,
  },
  discoverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  plusIcon: {
    marginLeft: -10,
    marginTop: -10,
  },
});
