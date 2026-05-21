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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useNavigation, AppScreen } from '../../context/NavigationContext';
import { useFavoritesContext } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { vehicles, featuredVehicle } from '../../mock/veiculos';
import { Vehicle } from '../../types/vehicle';

const ALL_VEHICLES: Vehicle[] = [featuredVehicle, ...vehicles];

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const NAV_ITEMS: { label: AppScreen; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { label: 'Início',   icon: 'home'        },
  { label: 'Veículos', icon: 'truck'       },
  { label: 'Comparar', icon: 'bar-chart-2' },
];

const RECENT_CONVERSATIONS = [
  'Ford Ranger Raptor vs Mitsubishi Triton HPE S',
  'Maverick Hybrid vale a pena pra cidade?',
  'Picape até R$ 250 mil pra família',
  'Diferença entre Ranger XLT e Limited',
  'Tremor é confortável no asfalto?',
  'Vale upgrade do SYNC 4?',
  'Melhores modelos de 2024 SUV para o Brasil',
];

const DRAWER_OFFSET = 400;

export function Sidebar({ visible, onClose }: SidebarProps) {
  const { activeScreen, navigate, openVehicle, openComparison } = useNavigation();
  const { favorites, comparisons } = useFavoritesContext();
  const { user, isAuthenticated, requestLogin } = useAuth();
  const { resetChat, isFavorited: chatFavorited, messages: chatMessages, toggleFavorite: toggleChatFavorite } = useChat();
  const firstUserMessage = chatMessages.find((m) => m.role === 'user');
  const chatPreview = firstUserMessage && firstUserMessage.role === 'user'
    ? firstUserMessage.text
    : 'Conversa com a RIVA';
  const favoriteVehicles = ALL_VEHICLES.filter((v) => favorites.includes(v.id));
  const favoriteComparisons = comparisons
    .map(([idA, idB]) => {
      const a = ALL_VEHICLES.find((v) => v.id === idA);
      const b = ALL_VEHICLES.find((v) => v.id === idB);
      return a && b ? { idA, idB, a, b } : null;
    })
    .filter((x): x is { idA: string; idB: string; a: Vehicle; b: Vehicle } => x !== null);
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

  function handleNavPress(screen: AppScreen) {
    navigate(screen);
  }

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

        {/* Navegação */}
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === activeScreen;
          return (
            <TouchableOpacity
              key={item.label}
              style={styles.navItem}
              onPress={() => handleNavPress(item.label)}
            >
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

        {/* Favoritos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>FAVORITOS</Text>
        </View>
        {!isAuthenticated ? null : favoriteVehicles.length === 0 && favoriteComparisons.length === 0 && !chatFavorited ? (
          <Text style={styles.emptyFavorites}>Nenhum favorito ainda</Text>
        ) : (
          <>
            {chatFavorited && (
              <TouchableOpacity
                style={styles.favoriteItem}
                onPress={() => { handleNavPress('Início'); onClose(); }}
                onLongPress={toggleChatFavorite}
              >
                <MaterialCommunityIcons name="star" size={12} color={Colors.accent} />
                <Text style={styles.favoriteTitle} numberOfLines={1}>
                  Conversa: {chatPreview}
                </Text>
              </TouchableOpacity>
            )}
            {favoriteVehicles.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={styles.favoriteItem}
                onPress={() => { openVehicle(v.id); onClose(); }}
              >
                <MaterialCommunityIcons name="star" size={12} color={Colors.accent} />
                <Text style={styles.favoriteTitle} numberOfLines={1}>
                  {v.versao}
                </Text>
              </TouchableOpacity>
            ))}
            {favoriteComparisons.map(({ idA, idB, a, b }) => (
              <TouchableOpacity
                key={`${idA}__${idB}`}
                style={styles.favoriteItem}
                onPress={() => { openComparison(idA, idB); onClose(); }}
              >
                <MaterialCommunityIcons name="star" size={12} color={Colors.accent} />
                <Text style={styles.favoriteTitle} numberOfLines={1}>
                  Comparação {a.versao} × {b.versao} salva
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Conversas recentes */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>CONVERSAS RECENTES</Text>
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

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Histórico </Text>
        
        {/* Rodapé — perfil */}
        <View style={styles.profileRow}>
          <TouchableOpacity
            style={styles.profilePill}
            onPress={() => {
              if (!isAuthenticated) {
                onClose();
                requestLogin({ type: 'login' });
                return;
              }
              navigate('Perfil');
              onClose();
            }}
          >
            {isAuthenticated && user ? (
              <>
                <View style={styles.avatar}>
                  <Text style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.profilePillName} numberOfLines={1}>{user.name}</Text>
              </>
            ) : (
              <>
                <View style={styles.avatar}>
                  <Feather name="user" size={14} color={Colors.textPrimary} />
                </View>
                <Text style={styles.profilePillName} numberOfLines={1}>Faça Login</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.newChatIcon}
            onPress={() => {
              resetChat();
              handleNavPress('Início');
              onClose();
            }}
          >
            <MaterialCommunityIcons name="message-plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionLabel: {
    color: Colors.textHint,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'Sora_600SemiBold',
  },
  emptyFavorites: {
    color: Colors.textHint,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    paddingVertical: 4,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
  },
  favoriteTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    flex: 1,
    fontFamily: 'Sora_400Regular',
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
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 12,
  },
  newChatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.action,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 16,
    paddingLeft: 4,
    paddingVertical: 4,
    borderRadius: Colors.radiusPill,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  profilePillName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Sora_500Medium',
    maxWidth: 120,
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