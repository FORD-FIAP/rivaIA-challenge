/** Tela inicial do app RIVA — hero fullscreen com chat conversacional */
import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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

/** Frases criativas exibidas abaixo da saudação — uma nova a cada visita à Home. */
const SUBTITLES_CREATIVAS = [
  'O que você quer descobrir sobre carros hoje?',
  'Bora encontrar o carro perfeito pra você?',
  'SUV, sedã ou picape? Me conta o que bateu o olho.',
  'Me diga o que você sonha em guiar.',
  'Qual carro tá rodando na sua cabeça hoje?',
  'Vamos achar seu próximo carro juntos?',
  'Me conta: cidade, estrada ou trilha?',
  'Tô pronta pra achar sua próxima garagem.',
];

// Índice fora do componente: garante que a frase mude a cada vez que a Home
// é montada, em vez de depender da sorte de um Math.random() isolado.
let subtitleIndex = Math.floor(Math.random() * SUBTITLES_CREATIVAS.length);
function nextSubtitleCreativa(): string {
  subtitleIndex = (subtitleIndex + 1) % SUBTITLES_CREATIVAS.length;
  return SUBTITLES_CREATIVAS[subtitleIndex];
}

export function HomeScreen() {
  const { openSidebar } = useNavigation();
  const { user, isAuthenticated, requestLogin } = useAuth();
  const { messages, hasConversation, isTyping, isFavorited, sendMessage, toggleFavorite } = useChat();

  const saudacao = useMemo(getSaudacao, []);
  const subtitleCreativa = useMemo(nextSubtitleCreativa, []);

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

  function handleSendMessage(_message: string, _attachment?: ChatAttachment) {
    // Chat mockado: o texto/anexo é descartado e o próximo turno
    // do roteiro (mock/rivaChat.ts) é revelado. Anexos passam a valer quando
    // o backend com IA (Gemini Flash) estiver integrado.
    sendMessage();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
            <RivaOrb />
            <View style={styles.greetingText}>
              <Text style={styles.title}>
                {saudacao}{user ? `, ${user.name}` : ''}.
              </Text>
              <Text style={styles.subtitle}>
                {user && user.preferences && user.preferences.trim().length > 0
                  ? `Vi que você curte ${user.preferences.trim()}. Quer ver opções nesse estilo?`
                  : subtitleCreativa}
              </Text>
            </View>
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
    ...StyleSheet.absoluteFillObject,
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
    gap: 38,
    marginTop: '18%',
  },
  greetingText: {
    alignItems: 'center',
    gap: 2,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1,
    textAlign: 'center',
    fontFamily: 'Sora_700Bold',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: 'Sora_400Regular',
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
