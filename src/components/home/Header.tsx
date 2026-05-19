/** Header fixo presente em todas as telas: histórico / RIVA ˅ / menu */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface HeaderProps {
  onMenuPress: () => void;
}

export function Header({ onMenuPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
        <Feather name="menu" size={18} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.bg,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: Colors.radiusPill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  }
});