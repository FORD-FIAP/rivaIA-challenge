/** Header fixo presente nas telas principais: wordmark RIVA / avatar ou menu */
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
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
      <Image
        source={require('../../../assets/logo-riva-navbar.png')}
        style={styles.logo}
        resizeMode="contain"
      />

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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.bg,
  },
  logo: {
    width: 40,
    height: 32,
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
