/** Drawer lateral presente em todas as telas com navegação e conversas recentes */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  activeScreen?: string;
}

const NAV_ITEMS = [
  { label: 'Início',    icon: 'home'     as const },
  { label: 'Veículos',  icon: 'truck'    as const },
  { label: 'Comparar',  icon: 'bar-chart-2' as const },
];

const RECENT_CONVERSATIONS = [
  'Ford Ranger Raptor vs Mitsubishi Triton HPE S',
  'Maverick Hybrid vale a pena pra cidade?',
  'Picape até R$ 250 mil pra família',
  'Diferença entre Ranger XLT e Limited',
  'Tremor é confortável no asfalto?',
  'Vale upgrade do SYNC 4?',
];

export function Sidebar({ visible, onClose, activeScreen = 'Início' }: SidebarProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={styles.drawer}>
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
          <ScrollView showsVerticalScrollIndicator={false}>
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    width: '82%',
    backgroundColor: Colors.surface,
    padding: 20,
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
    textTransform: 'uppercase',
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
