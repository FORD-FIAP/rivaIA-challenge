/** Header fixo presente em todas as telas: histórico / RIVA ˅ / menu */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface HeaderProps {
  onMenuPress: () => void;
}

export function Header({ onMenuPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
        <Feather name="menu" size={20} color={Colors.textMuted} />
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
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  }
});