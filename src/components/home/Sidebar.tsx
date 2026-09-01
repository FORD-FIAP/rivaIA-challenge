/** Drawer lateral — overlay absoluto (não usa Modal para ficar dentro do phone frame) */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useConversasRecentesContext } from '../../context/ConversasRecentesContext';
import { noticias } from '../../mock/noticias';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const DRAWER_OFFSET = 400;

export function Sidebar({ visible, onClose }: SidebarProps) {
  const insets = useSafeAreaInsets();
  const { navigate } = useNavigation();
  const { user, isAuthenticated, requestLogin } = useAuth();
  const { resetChat, loadConversation } = useChat();
  const { conversas: conversasRecentes } = useConversasRecentesContext();
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

  function handleNavigate(screen: Parameters<typeof navigate>[0]) {
    navigate(screen);
  }

  function handleNewChat() {
    resetChat();
    handleNavigate('Início');
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
          {/* Histórico de conversas */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>HISTÓRICO</Text>
            {conversasRecentes.length > 0 && (
              <Text style={styles.sectionCaption}>Todos os chats</Text>
            )}
          </View>
          {!isAuthenticated ? (
            <Text style={styles.emptyText}>Faça login para ver seu histórico de conversas</Text>
          ) : conversasRecentes.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma conversa recente</Text>
          ) : (
            conversasRecentes.map((c, idx) => (
              <TouchableOpacity
                key={`${c.titulo}-${idx}`}
                style={styles.listItem}
                onPress={() => {
                  loadConversation({
                    messages: c.messages,
                    cursor: c.cursor,
                    favorited: c.favorited,
                  });
                  handleNavigate('Início');
                  onClose();
                }}
              >
                <Feather name="message-circle" size={13} color={Colors.textMuted} />
                <Text style={styles.listItemLabel} numberOfLines={1}>
                  {c.titulo}
                </Text>
              </TouchableOpacity>
            ))
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

        {/* Rodapé — perfil + novo chat */}
        <View style={styles.profileRow}>
          <TouchableOpacity
            style={styles.profilePill}
            onPress={() => {
              if (!isAuthenticated) {
                onClose();
                requestLogin({ type: 'login' });
                return;
              }
              handleNavigate('Perfil');
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
                <Text style={styles.profilePillName} numberOfLines={1}>Entrar</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.newChatIcon} onPress={handleNewChat}>
            <Feather name="plus" size={22} color="#FFFFFF" />
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'Sora_600SemiBold',
    marginBottom: 8,
  },
  sectionCaption: {
    color: Colors.textHint,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.textHint,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
    paddingVertical: 4,
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
    backgroundColor: Colors.surface2,
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
});
