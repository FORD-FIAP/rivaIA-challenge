/** Header fixo presente em todas as telas: histórico / RIVA ˅ / menu */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface HeaderProps {
  onMenuPress: () => void;
}

export function Header({ onMenuPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton}>
        <Feather name="clock" size={20} color={Colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.titleRow}>
        <Text style={styles.title}>RIVA</Text>
        <Feather size={14} color={Colors.textMuted} />
      </TouchableOpacity>

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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 52,
    backgroundColor: Colors.bg,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: 'Sora_600SemiBold',
  },
});