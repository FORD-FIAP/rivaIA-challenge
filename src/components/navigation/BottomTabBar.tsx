/** Navegação inferior fixa — Início, Veículos, Comparar, Perfil */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useNavigation, AppScreen } from '../../context/NavigationContext';

const TAB_ITEMS: { label: AppScreen; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { label: 'Início',   icon: 'home'        },
  { label: 'Veículos', icon: 'truck'       },
  { label: 'Comparar', icon: 'bar-chart-2' },
  { label: 'Perfil',   icon: 'user'        },
];

export function BottomTabBar() {
  const insets = useSafeAreaInsets();
  const { activeScreen, navigate } = useNavigation();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      {TAB_ITEMS.map((item) => {
        const isActive = item.label === activeScreen;
        return (
          <TouchableOpacity
            key={item.label}
            style={styles.tab}
            onPress={() => navigate(item.label)}
            activeOpacity={0.7}
          >
            <Feather
              name={item.icon}
              size={20}
              color={isActive ? Colors.textPrimary : Colors.textMuted}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Sora_500Medium',
  },
  labelActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
});
