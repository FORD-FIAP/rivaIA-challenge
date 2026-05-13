/** Drawer lateral — overlay absoluto (não usa Modal para ficar dentro do phone frame) */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  activeScreen?: string;
}

const NAV_ITEMS = [
  { label: 'Início',   icon: 'home'         as const },
  { label: 'Veículos', icon: 'truck'         as const },
  { label: 'Comparar', icon: 'bar-chart-2'   as const },
];

const RECENT_CONVERSATIONS = [
  'Ford Ranger Raptor vs Mitsubishi Triton HPE S',
  'Maverick Hybrid vale a pena pra cidade?',
  'Picape até R$ 250 mil pra família',
  'Diferença entre Ranger XLT e Limited',
  'Tremor é confortável no asfalto?',
  'Vale upgrade do SYNC 4?',
];

/** Distância off-screen (direita) quando fechada */
const DRAWER_OFFSET = 400;

export function Sidebar({ visible, onClose, activeScreen = 'Início' }: SidebarProps) {
  const slideAnim = useRef(new Animated.Value(DRAWER_OFFSET)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : DRAWER_OFFSET,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: visible ? 1 : 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Backdrop semitransparente */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Drawer deslizante da direita */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
      >
        {/* Cabeçalho */}
        <View style={styles.drawerHeader}>
          <View style={styles.orbSmall} />
          <View style={{ flex: 1 }}>
            <Text style={styles.drawerTitle}>RIVA</Text>
            <Text style={styles.drawerSubtitle}>Sua consultora de carros</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Botão novo chat */}
        <TouchableOpacity style={styles.newChatButton}>
          <Feather name="plus" size={16} color={Colors.accent} />
          <Text style={styles.newChatLabel}>Novo chat</Text>
        </TouchableOpacity>

        {/* Navegação */}
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === activeScreen;
          return (
            <TouchableOpacity key={item.label} style={styles.navItem}>
              <Feather
                name={item.icon}
                size={16}
                color={isActive ? Colors.textPrimary : Colors.textMuted}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}

        {/* Conversas recentes */}
        <Text style={styles.sectionLabel}>CONVERSAS RECENTES</Text>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {RECENT_CONVERSATIONS.map((title) => (
            <TouchableOpacity key={title} style={styles.conversationItem}>
              <Feather name="message-circle" size={13} color={Colors.textMuted} />
              <Text style={styles.conversationTitle} numberOfLines={1}>
                {title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Rodapé — perfil */}
        <TouchableOpacity style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>M</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Mariana Dourado</Text>
            <Text style={styles.profileLogin}>Faça login</Text>
          </View>
          <Feather name="chevron-right" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '82%',
    backgroundColor: Colors.surface,
    padding: 20,
    paddingTop: 24,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  orbSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.action,
    shadowColor: Colors.action,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  drawerTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  drawerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
  },
  closeButton: {
    padding: 4,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusLg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  newChatLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Sora_500Medium',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  navLabel: {
    color: Colors.textMuted,
    fontSize: 14,
    flex: 1,
    fontFamily: 'Sora_400Regular',
  },
  navLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  sectionLabel: {
    color: Colors.textHint,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 8,
    fontFamily: 'Sora_600SemiBold',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  conversationTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    flex: 1,
    fontFamily: 'Sora_400Regular',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.action,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  profileName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  profileLogin: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
  },
});