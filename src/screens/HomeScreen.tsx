/** Tela inicial do app RIVA — hero fullscreen com chat conversacional */
import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/home/Header';
import { RivaOrb } from '../components/home/RivaOrb';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { ChatInput, ChatAttachment } from '../components/home/ChatInput';
import { ChatThread } from '../components/home/ChatThread';
import { Colors } from '../theme/colors';

function getSaudacao(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function HomeScreen() {
  const { openSidebar } = useNavigation();
  const { user, isAuthenticated, requestLogin } = useAuth();
  const { messages, hasConversation, isTyping, isFavorited, sendMessage, toggleFavorite } = useChat();

  const saudacao = useMemo(getSaudacao, []);

  function handleToggleFavoriteChat() {
    if (isAuthenticated) {
      toggleFavorite();
    } else {
      requestLogin({ type: 'chat' }, toggleFavorite);
    }
  }

  const chatAnim = useRef(new Animated.Value(hasConversation ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(chatAnim, {
      toValue: hasConversation ? 1 : 0,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [hasConversation, chatAnim]);

  function handleSendMessage(message: string, attachment?: ChatAttachment) {
    // Anexos (imagem/áudio) ficam prontos no ChatInput, mas só passam a valer
    // de verdade quando o backend com IA (Gemini Flash) estiver integrado.
    // Por ora, ao menos garantimos um retorno visível na conversa.
    const texto = message.trim()
      || (attachment?.imageUri ? '📷 Imagem anexada' : attachment?.audioUri ? '🎤 Mensagem de voz' : '');
    sendMessage(texto);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Header onMenuPress={openSidebar} isAuthenticated={isAuthenticated} userInitial={user?.name?.charAt(0)} />

      <View style={styles.hero}>

        {/* Camada Greeting — fica visível enquanto não há conversa */}
        <Animated.View
          style={[
            styles.heroLayer,
            styles.greetingLayer,
            {
              opacity: chatAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              transform: [
                {
                  translateY: chatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -16],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={hasConversation ? 'none' : 'auto'}
        >
          <View style={styles.greetingBlock}>
            <Image
              source={require('../../assets/logo-riva.png')}
              style={styles.greetingLogo}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              {saudacao}{user ? `, ${user.name}` : ''}
            </Text>
          </View>

          <View style={styles.bottomBlock}>
            <View style={styles.composerWrapper}>
              <ChatInput onSend={handleSendMessage} />
            </View>
          </View>
        </Animated.View>

        {/* Camada Chat — entra com fade/translate quando há conversa */}
        <Animated.View
          style={[
            styles.heroLayer,
            styles.chatLayer,
            {
              opacity: chatAnim,
              transform: [
                {
                  translateY: chatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={hasConversation ? 'auto' : 'none'}
        >
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              <RivaOrb size={28} />
              <View>
                <Text style={styles.chatHeaderTitle}>RIVA</Text>
                <Text style={styles.chatHeaderSubtitle}>Assistente de veículos</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleToggleFavoriteChat}
              style={styles.chatFavBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name={isFavorited ? 'star' : 'star-outline'}
                size={18}
                color={isFavorited ? Colors.accent : Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.chatThreadWrapper}>
            <ChatThread messages={messages} isTyping={isTyping} />
          </View>

          <View style={styles.composerWrapper}>
            <ChatInput onSend={handleSendMessage} />
          </View>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  hero: {
    flex: 1,
    position: 'relative',
  },
  heroLayer: {
    ...StyleSheet.absoluteFill,
  },
  greetingLayer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 96,
  },
  chatLayer: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatHeaderTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Sora_700Bold',
  },
  chatHeaderSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
  },
  chatFavBtn: {
    width: 38,
    height: 38,
    borderRadius: Colors.radiusPill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatThreadWrapper: {
    flex: 1,
    minHeight: 0,
  },
  greetingBlock: {
    alignItems: 'center',
    gap: 14,
    marginTop: '18%',
  },
  greetingLogo: {
    width: 136,
    height: 136,
    borderRadius: Colors.radiusLg,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1,
    textAlign: 'center',
    fontFamily: 'Sora_700Bold',
  },
  bottomBlock: {
    width: '100%',
    gap: 24,
    alignItems: 'center',
  },
  composerWrapper: {
    width: '100%',
  },
});
