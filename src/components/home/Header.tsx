/** Header fixo presente nas telas principais: avatar ou menu, sem wordmark (a marca fica no orb da Home) */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface HeaderProps {
  onMenuPress: () => void;
  isAuthenticated?: boolean;
  userInitial?: string;
}

export function Header({ onMenuPress, isAuthenticated, userInitial }: HeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
        {isAuthenticated && userInitial ? (
          <Text style={styles.avatarLetter}>{userInitial.toUpperCase()}</Text>
        ) : (
          <Feather name="menu" size={18} color={Colors.textPrimary} />
        )}
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
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarLetter: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
});
