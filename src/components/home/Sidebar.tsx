/** Drawer lateral — overlay absoluto (não usa Modal para ficar dentro do phone frame) */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useNavigation, AppScreen } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useConversasRecentesContext } from '../../context/ConversasRecentesContext';
import { useFavoritesContext } from '../../context/FavoritesContext';
import { ConversaArquivada } from '../../hooks/useConversasRecentes';
import { noticias } from '../../mock/noticias';
import { getCachedVehicle } from '../../services/fipeApi';
import { Vehicle } from '../../types/vehicle';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const DRAWER_OFFSET = 400;
const MAX_RECENTES_VISIVEIS = 7;
const MAX_FAVORITOS_VISIVEIS = 4;

const NAV_ITEMS: { label: AppScreen; icon: React.ComponentProps<typeof Feather>['name'] | null; iconMci?: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
  { label: 'Início',   icon: 'home'        },
  { label: 'Veículos', icon: null, iconMci: 'car-side' },
  { label: 'Comparar', icon: 'bar-chart-2' },
];

/** Seleciona os itens exibidos direto na sidebar: no máx. 4 favoritados e 7 no total,
 * mantendo a ordem de recência. O restante só aparece na tela "Todos os Chats". */
function selecionarRecentesVisiveis(conversas: ConversaArquivada[]) {
  const visiveis: ConversaArquivada[] = [];
  let favoritosContados = 0;
  for (const c of conversas) {
    if (visiveis.length >= MAX_RECENTES_VISIVEIS) break;
    if (c.favorited) {
      if (favoritosContados >= MAX_FAVORITOS_VISIVEIS) continue;
      favoritosContados++;
    }
    visiveis.push(c);
  }
  return visiveis;
}

export function Sidebar({ visible, onClose }: SidebarProps) {
  const insets = useSafeAreaInsets();
  const { activeScreen, navigate, openVehicle } = useNavigation();
  const { user, isAuthenticated, requestLogin } = useAuth();
  const { resetChat, loadConversation } = useChat();
  const { conversas: conversasRecentes } = useConversasRecentesContext();
  const { favorites } = useFavoritesContext();
  const favoriteVehicles = favorites
    .map((id) => getCachedVehicle(id))
    .filter((v): v is Vehicle => v !== undefined);
  const [view, setView] = useState<'menu' | 'chats'>('menu');
  const [filtro, setFiltro] = useState<'todos' | 'favoritos'>('todos');
  const [filtroAberto, setFiltroAberto] = useState(false);
  const slideAnim = useRef(new Animated.Value(DRAWER_OFFSET)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const recentesVisiveis = useMemo(
    () => selecionarRecentesVisiveis(conversasRecentes),
    [conversasRecentes],
  );
  const temMaisRecentes = conversasRecentes.length > recentesVisiveis.length;

  const chatsFiltrados = filtro === 'favoritos'
    ? conversasRecentes.filter((c) => c.favorited)
    : conversasRecentes;

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
    if (!visible) {
      setView('menu');
      setFiltro('todos');
      setFiltroAberto(false);
    }
  }, [visible]);

  function handleNavigate(screen: Parameters<typeof navigate>[0]) {
    navigate(screen);
  }

  function handleNewChat() {
    resetChat();
    handleNavigate('Início');
    onClose();
  }

  function handleAbrirConversa(c: ConversaArquivada) {
    loadConversation({
      messages: c.messages,
      favorited: c.favorited,
    });
    handleNavigate('Início');
    onClose();
  }

  function handleAbrirVeiculo(id: string) {
    openVehicle(id);
    onClose();
  }

  function handleAvatarPress() {
    if (!isAuthenticated) {
      onClose();
      requestLogin({ type: 'login' });
      return;
    }
    handleNavigate('Perfil');
    onClose();
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
        style={[
          styles.drawer,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {view === 'chats' ? (
          <>
            {/* Cabeçalho da tela "Todos os Chats" */}
            <View style={styles.drawerHeader}>
              <TouchableOpacity onPress={() => setView('menu')} style={styles.closeButton}>
                <Feather name="chevron-left" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
              <Text style={styles.chatsScreenTitle}>Chats</Text>
              <TouchableOpacity onPress={() => setFiltroAberto((v) => !v)} style={styles.closeButton}>
                <Feather name="filter" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {filtroAberto && (
              <View style={styles.filterDropdown}>
                <TouchableOpacity
                  style={styles.filterOption}
                  onPress={() => { setFiltro('todos'); setFiltroAberto(false); }}
                >
                  <Feather name={filtro === 'todos' ? 'check' : 'message-circle'} size={14} color={filtro === 'todos' ? Colors.accent : Colors.textMuted} />
                  <Text style={styles.filterOptionLabel}>Todos os chats</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.filterOption}
                  onPress={() => { setFiltro('favoritos'); setFiltroAberto(false); }}
                >
                  <Feather name={filtro === 'favoritos' ? 'check' : 'star'} size={14} color={filtro === 'favoritos' ? Colors.accent : Colors.textMuted} />
                  <Text style={styles.filterOptionLabel}>Favoritos</Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {chatsFiltrados.length === 0 ? (
                <Text style={styles.emptyText}>
                  {filtro === 'favoritos' ? 'Nenhum chat favoritado ainda' : 'Nenhuma conversa recente'}
                </Text>
              ) : (
                chatsFiltrados.map((c, idx) => (
                  <TouchableOpacity
                    key={`${c.titulo}-${idx}`}
                    style={styles.listItem}
                    onPress={() => handleAbrirConversa(c)}
                  >
                    <Feather name="message-circle" size={13} color={Colors.textMuted} />
                    <Text style={styles.listItemLabel} numberOfLines={1}>
                      {c.titulo}
                    </Text>
                    {c.favorited && <Feather name="star" size={13} color={Colors.accent} />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </>
        ) : (
          <>
            {/* Cabeçalho */}
            <View style={styles.drawerHeader}>
              <Image
                source={require('../../../assets/logo-riva-navbar.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {/* Navegação principal */}
              <View style={styles.navList}>
                {NAV_ITEMS.map((item) => {
                  const isActive = item.label === activeScreen;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      style={styles.navItem}
                      onPress={() => { handleNavigate(item.label); onClose(); }}
                    >
                      {item.icon ? (
                        <Feather
                          name={item.icon}
                          size={18}
                          color={isActive ? Colors.textPrimary : Colors.textMuted}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name={item.iconMci!}
                          size={18}
                          color={isActive ? Colors.textPrimary : Colors.textMuted}
                        />
                      )}
                      <Text style={[styles.navItemLabel, isActive && styles.navItemLabelActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Favoritos */}
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>FAVORITOS</Text>
              {!isAuthenticated ? (
                <Text style={styles.emptyText}>Faça login para salvar seus veículos</Text>
              ) : favoriteVehicles.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum veículo favoritado ainda</Text>
              ) : (
                favoriteVehicles.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={styles.listItem}
                    onPress={() => handleAbrirVeiculo(v.id)}
                  >
                    <Feather name="star" size={13} color={Colors.accent} />
                    <Text style={styles.listItemLabel} numberOfLines={1}>
                      {v.versao}
                    </Text>
                  </TouchableOpacity>
                ))
              )}

              {/* Recentes */}
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>RECENTES</Text>
              {!isAuthenticated ? (
                <Text style={styles.emptyText}>Faça login para ver seus chats recentes</Text>
              ) : recentesVisiveis.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma conversa recente</Text>
              ) : (
                <>
                  {recentesVisiveis.map((c, idx) => (
                    <TouchableOpacity
                      key={`${c.titulo}-${idx}`}
                      style={styles.listItem}
                      onPress={() => handleAbrirConversa(c)}
                    >
                      <Feather name="message-circle" size={13} color={Colors.textMuted} />
                      <Text style={styles.listItemLabel} numberOfLines={1}>
                        {c.titulo}
                      </Text>
                      {c.favorited && <Feather name="star" size={13} color={Colors.accent} />}
                    </TouchableOpacity>
                  ))}
                  {temMaisRecentes && (
                    <TouchableOpacity onPress={() => setView('chats')}>
                      <Text style={styles.verMaisLink}>Veja mais</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {/* Notícias — atualidades do mercado automotivo trazidas pela IA da RIVA */}
              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>NOTÍCIAS</Text>
              {noticias.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma novidade por enquanto</Text>
              ) : (
                noticias.map((n) => (
                  <View key={n.id} style={styles.listItem}>
                    <Feather name="file-text" size={13} color={Colors.textMuted} />
                    <Text style={styles.listItemLabel} numberOfLines={1}>
                      {n.titulo}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Rodapé — avatar/perfil + novo chat */}
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.avatar} onPress={handleAvatarPress}>
                {isAuthenticated && user ? (
                  <Text style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
                ) : (
                  <Feather name="user" size={16} color={Colors.textPrimary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
                <Feather name="plus" size={16} color="#FFFFFF" />
                <Text style={styles.newChatLabel}>Novo chat</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '82%',
    backgroundColor: Colors.sidebarBg,
    paddingHorizontal: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 40,
    height: 32,
  },
  closeButton: {
    padding: 4,
  },
  chatsScreenTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  filterDropdown: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: Colors.surface2,
    borderRadius: Colors.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 6,
    zIndex: 10,
    elevation: 10,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  filterOptionLabel: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_500Medium',
  },
  navList: {
    gap: 2,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 11,
  },
  navItemLabel: {
    color: Colors.textMuted,
    fontSize: 15,
    fontFamily: 'Sora_500Medium',
  },
  navItemLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'Sora_600SemiBold',
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.textHint,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
    paddingVertical: 4,
  },
  verMaisLink: {
    color: Colors.accent,
    fontSize: 13,
    fontFamily: 'Sora_600SemiBold',
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
  },
  listItemLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    flex: 1,
    fontFamily: 'Sora_400Regular',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 18,
    borderRadius: Colors.radiusPill,
    backgroundColor: Colors.action,
  },
  newChatLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
});
