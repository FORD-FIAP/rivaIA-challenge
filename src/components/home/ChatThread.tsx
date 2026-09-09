/**
 * ChatThread — renderiza a conversa da Home.
 *
 * Layout inspirado na UI do Claude (iOS): tipografia respirada, sem balão
 * "boxed" para a RIVA. Enquanto não há IA de verdade por trás (backend +
 * Gemini Flash), as mensagens são só texto simples.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { Colors } from '../../theme/colors';
import { RivaOrb } from './RivaOrb';
import { ChatMessage } from '../../context/ChatContext';
import { MarkdownText } from './MarkdownText';

interface ChatThreadProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export function ChatThread({ messages, isTyping }: ChatThreadProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [messages, isTyping]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((msg) =>
        msg.role === 'user' ? (
          <UserBubble key={msg.id} text={msg.text} />
        ) : (
          <RivaBubble key={msg.id} text={msg.text} />
        ),
      )}
      {isTyping && <TypingBubble />}
    </ScrollView>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <View style={styles.userRow}>
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{text}</Text>
      </View>
    </View>
  );
}

function RivaBubble({ text }: { text: string }) {
  return (
    <View style={styles.rivaRow}>
      <View style={styles.rivaAvatarCol}>
        <RivaOrb size={22} />
      </View>
      <View style={styles.rivaContent}>
        <Text style={styles.rivaLabel}>
          RIVA <Text style={styles.rivaLabelMuted}>· agente automotivo</Text>
        </Text>
        <MarkdownText text={text} style={styles.bodyText} boldStyle={styles.bodyTextBold} />
      </View>
    </View>
  );
}

function TypingBubble() {
  const a = useRef(new Animated.Value(0.3)).current;
  const b = useRef(new Animated.Value(0.3)).current;
  const c = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ]),
      ).start();
    loop(a, 0);
    loop(b, 150);
    loop(c, 300);
  }, [a, b, c]);

  return (
    <View style={styles.rivaRow}>
      <View style={styles.rivaAvatarCol}>
        <RivaOrb size={22} />
      </View>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.dot, { opacity: a }]} />
        <Animated.View style={[styles.dot, { opacity: b }]} />
        <Animated.View style={[styles.dot, { opacity: c }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 24,
  },
  userRow: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  userBubble: {
    maxWidth: '85%',
    backgroundColor: Colors.inputBg,
    borderRadius: Colors.radiusXl,
    borderBottomRightRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Sora_400Regular',
    lineHeight: 20,
  },
  rivaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingRight: 4,
  },
  rivaAvatarCol: {
    paddingTop: 2,
  },
  rivaContent: {
    flex: 1,
    gap: 8,
  },
  rivaLabel: {
    color: Colors.accent,
    fontSize: 11,
    fontFamily: 'Sora_700Bold',
    letterSpacing: 0.6,
  },
  rivaLabelMuted: {
    color: Colors.textMuted,
    fontFamily: 'Sora_400Regular',
    letterSpacing: 0,
  },
  bodyText: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Sora_400Regular',
  },
  bodyTextBold: {
    fontFamily: 'Sora_700Bold',
    fontWeight: '700',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    flex: 0,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
});
