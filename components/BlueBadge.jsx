import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function BlueBadge({ size = 18, style }) {
  return (
    <View style={[{ marginLeft: 2 }, style]}>
      <MaterialIcons name="verified" size={size} color="#1E3A8A" />
    </View>
  );
}
