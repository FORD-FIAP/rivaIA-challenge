/* ChatThread — renderiza a conversa mockada da Home. */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Linking, } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { RivaOrb } from './RivaOrb';
import {
  ScriptedMessage,
  RivaVehicleInfo,
  RivaComparison,
} from '../../mock/rivaChat';

interface ChatThreadProps {
  messages: ScriptedMessage[];
  isTyping: boolean;
}

export function ChatThread({ messages, isTyping }: ChatThreadProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Pequeno delay para o layout assentar antes de rolar.
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
      {messages.map((msg) => {
        if (msg.role === 'user') {
          return <UserBubble key={msg.id} text={msg.text} />;
        }
        if (msg.type === 'vehicle_info') {
          return <VehicleInfoBubble key={msg.id} data={msg} />;
        }
        return <ComparisonBubble key={msg.id} data={msg} />;
      })}
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

function RivaShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.rivaRow}>
      <View style={styles.rivaAvatarCol}>
        <RivaOrb size={20} />
      </View>
      <View style={styles.rivaContent}>
        <Text style={styles.rivaLabel}>
          RIVA <Text style={styles.rivaLabelMuted}>· agente automotivo</Text>
        </Text>
        {children}
      </View>
    </View>
  );
}

function VehicleInfoBubble({ data }: { data: RivaVehicleInfo }) {
  return (
    <RivaShell>
      <Text style={styles.rivaIntro}>{data.intro}</Text>

      {!!data.text && <Text style={styles.rivaIntro}>{data.text}</Text>}

      {data.specs.length > 0 && (
        <View style={styles.specsBlock}>
          {data.specs.map((spec) => (
            <View key={spec.label} style={styles.specRow}>
              <Text style={styles.specLabel}>{spec.label}</Text>
              <Text style={styles.specValue}>{spec.value}</Text>
            </View>
          ))}
        </View>
      )}

      {data.modeBadges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modos de condução</Text>
          <View style={styles.badgesWrap}>
            {data.modeBadges.map((b) => (
              <View
                key={b.label}
                style={[styles.modeBadge, b.highlight && styles.modeBadgeHighlight]}
              >
                <Text
                  style={[
                    styles.modeBadgeText,
                    b.highlight && styles.modeBadgeTextHighlight,
                  ]}
                >
                  {b.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!!data.priceNote && (
        <View style={styles.priceNote}>
          <MaterialCommunityIcons name="cash" size={14} color="#E8A020" />
          <Text style={styles.priceNoteText}>{data.priceNote}</Text>
        </View>
      )}

      {!!data.youtube.link && (
        <TouchableOpacity
          style={styles.youtubeCard}
          activeOpacity={0.85}
          onPress={() => Linking.openURL(data.youtube.link).catch(() => {})}
        >
          <View style={styles.youtubeThumb}>
            <Feather name="play" size={18} color="#fff" />
          </View>
          <View style={styles.youtubeBody}>
            <Text style={styles.youtubeTitle} numberOfLines={2}>
              Assistir no YouTube
            </Text>
            <Text style={styles.youtubeMeta} numberOfLines={1}>
              {data.youtube.link}
            </Text>
          </View>
          <Feather name="external-link" size={14} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </RivaShell>
  );
}

function ComparisonBubble({ data }: { data: RivaComparison }) {
  return (
    <RivaShell>
      <Text style={styles.rivaIntro}>{data.intro}</Text>

      <View style={styles.comparisonTable}>
        <View style={[styles.compRow, styles.compHeader]}>
          <Text style={[styles.compCell, styles.compCellAttr, styles.compHeaderText]}>
            Atributo
          </Text>
          <Text style={[styles.compCell, styles.compHeaderText]}>Raptor</Text>
          <Text style={[styles.compCell, styles.compHeaderText]}>Triton</Text>
        </View>
        {data.comparisonRows.map((row) => (
          <View key={row.attribute} style={styles.compRow}>
            <Text style={[styles.compCell, styles.compCellAttr]}>{row.attribute}</Text>
            <Text
              style={[
                styles.compCell,
                row.winner === 'raptor' && styles.compWinner,
              ]}
            >
              {row.raptor}
            </Text>
            <Text
              style={[
                styles.compCell,
                row.winner === 'triton' && styles.compWinner,
              ]}
            >
              {row.triton}
            </Text>
          </View>
        ))}
      </View>

      {data.verdicts.length > 0 && (
        <View style={styles.verdictsWrap}>
          {data.verdicts.map((v) => (
            <View
              key={v.label}
              style={[
                styles.verdictChip,
                v.variant === 'triton' && styles.verdictChipAlt,
              ]}
            >
              <Text
                style={[
                  styles.verdictText,
                  v.variant === 'triton' && styles.verdictTextAlt,
                ]}
              >
                {v.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {data.sources.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fontes</Text>
          <View style={{ gap: 8 }}>
            {data.sources.map((s) => (
              <View key={s.title} style={styles.sourceCard}>
                <View style={styles.sourceIcon}>
                  <Feather
                    name={s.type === 'video' ? 'play' : 'message-square'}
                    size={14}
                    color={Colors.accent}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sourceTitle} numberOfLines={2}>
                    {s.title}
                  </Text>
                  <Text style={styles.sourceMeta}>{s.source}</Text>
                </View>
                <View style={styles.sourceBadge}>
                  <Text style={styles.sourceBadgeText}>{s.badge}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {!!data.tip && (
        <View style={styles.tipBox}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={Colors.accent} />
          <Text style={styles.tipText}>{data.tip}</Text>
        </View>
      )}
    </RivaShell>
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
        <RivaOrb size={20} />
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
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },

  // User
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
    paddingVertical: 11,
  },
  userText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Sora_400Regular',
    lineHeight: 20,
  },

  // RIVA shell — sem balão, layout aberto
  rivaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingRight: 12,
  },
  rivaAvatarCol: {
    paddingTop: 4,
  },
  rivaContent: {
    flex: 1,
    gap: 10,
  },
  rivaLabel: {
    color: Colors.accent,
    fontSize: 11,
    fontFamily: 'Sora_700Bold',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  rivaLabelMuted: {
    color: Colors.textMuted,
    fontFamily: 'Sora_400Regular',
    letterSpacing: 0,
  },
  rivaIntro: {
    color: Colors.textPrimary,
    fontSize: 13.5,
    lineHeight: 20,
    fontFamily: 'Sora_400Regular',
  },

  // Especificações
  specsBlock: {
    backgroundColor: 'rgba(56,109,189,0.08)',
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  specLabel: {
    color: Colors.textMuted,
    fontSize: 12.5,
    fontFamily: 'Sora_400Regular',
  },
  specValue: {
    color: Colors.textPrimary,
    fontSize: 12.5,
    fontFamily: 'Sora_600SemiBold',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 8,
  },

  // Sections
  section: { gap: 8 },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: 'Sora_700Bold',
  },

  // Modes
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modeBadge: {
    borderRadius: Colors.radiusPill,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modeBadgeHighlight: {
    backgroundColor: 'rgba(232,160,32,0.15)',
    borderColor: '#E8A020',
  },
  modeBadgeText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'Sora_500Medium',
  },
  modeBadgeTextHighlight: { color: '#E8A020' },

  // Price note
  priceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(232,160,32,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,160,32,0.3)',
    borderRadius: Colors.radiusLg,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  priceNoteText: {
    flex: 1,
    color: '#E8A020',
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    lineHeight: 18,
  },

  // YouTube card
  youtubeCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.inputBg,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
  },
  youtubeThumb: {
    width: 56,
    height: 56,
    borderRadius: Colors.radiusMd,
    backgroundColor: '#7A0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubeBody: { flex: 1, justifyContent: 'center', gap: 4 },
  youtubeTitle: {
    color: Colors.textPrimary,
    fontSize: 12.5,
    fontFamily: 'Sora_600SemiBold',
    lineHeight: 17,
  },
  youtubeMeta: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
  },

  // Comparison table
  comparisonTable: {
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  compRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  compHeader: {
    backgroundColor: 'rgba(56,109,189,0.15)',
  },
  compHeaderText: {
    color: Colors.textSecondary,
    fontFamily: 'Sora_700Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  compCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    color: Colors.textPrimary,
    fontSize: 11.5,
    fontFamily: 'Sora_400Regular',
  },
  compCellAttr: {
    flex: 1.1,
    color: Colors.textMuted,
    fontFamily: 'Sora_500Medium',
  },
  compWinner: {
    color: Colors.accent,
    fontFamily: 'Sora_600SemiBold',
  },

  // Verdicts
  verdictsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  verdictChip: {
    backgroundColor: 'rgba(5,211,248,0.12)',
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  verdictChipAlt: {
    backgroundColor: 'rgba(232,160,32,0.12)',
    borderColor: '#E8A020',
  },
  verdictText: {
    color: Colors.accent,
    fontSize: 11.5,
    fontFamily: 'Sora_600SemiBold',
  },
  verdictTextAlt: {
    color: '#E8A020',
  },

  // Sources
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.inputBg,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  sourceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(5,211,248,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceTitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontFamily: 'Sora_600SemiBold',
    lineHeight: 16,
  },
  sourceMeta: {
    color: Colors.textMuted,
    fontSize: 10.5,
    fontFamily: 'Sora_400Regular',
    marginTop: 2,
  },
  sourceBadge: {
    backgroundColor: 'rgba(56,109,189,0.2)',
    borderRadius: Colors.radiusSm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sourceBadgeText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'Sora_700Bold',
  },

  // Tip
  tipBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(5,211,248,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(5,211,248,0.3)',
    borderRadius: Colors.radiusLg,
    padding: 10,
  },
  tipText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Sora_400Regular',
  },

  // Typing
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
