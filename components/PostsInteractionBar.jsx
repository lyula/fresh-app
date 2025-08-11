import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PostsInteractionBar({ likes, comments, shareCount, views, onLike, onComment, onShare }) {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.actionBtn}>
          <Icon name="heart" size={18} color="#e53935" />
          <View style={{ width: 8 }} />
          <TouchableOpacity onPress={onLike}>
            <Text style={styles.actionText}>{likes}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionBtn}>
          <TouchableOpacity onPress={onComment}>
            <Icon name="comment" size={18} color="#6b7280" />
          </TouchableOpacity>
          <View style={{ width: 8 }} />
          <TouchableOpacity onPress={onComment}>
            <Text style={styles.actionText}>{comments}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
          <Icon name="share" size={16} color="#6b7280" />
          <Text style={styles.actionText}>{shareCount}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.viewsContainer}>
        <MaterialCommunityIcons name="chart-bar" size={17} color="#6b7280" />
        <Text style={styles.actionText}>{views || 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
    paddingLeft: 13,
    paddingRight: 13,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  actionText: {
    marginLeft: 5,
    color: '#444',
    fontSize: 15,
    fontWeight: '500',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
});
