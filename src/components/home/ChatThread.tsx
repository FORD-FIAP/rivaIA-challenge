/**
 * ChatThread — renderiza a conversa mockada da Home.
 *
 * Layout inspirado na UI do Claude (iOS): tipografia respirada, divisórias
 * finas entre linhas, sem caixas "boxed" agrupando tudo. Cada seção tem
 * espaçamento generoso e o conteúdo "flui" sem balão da RIVA.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { RivaOrb } from './RivaOrb';
import {
  ScriptedMessage,
  RivaVehicleInfo,
  RivaComparison,
  RivaRich,
  SourceLink,
  ComparisonSpec,
  SpecItem,
} from '../../mock/rivaChat';

interface ChatThreadProps {
  messages: ScriptedMessage[];
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
      {messages.map((msg) => {
        if (msg.role === 'user') {
          return <UserBubble key={msg.id} text={msg.text} />;
        }
        if (msg.type === 'vehicle_info') {
          return <VehicleInfoBubble key={msg.id} data={msg} />;
        }
        if (msg.type === 'rich') {
          return <RichBubble key={msg.id} data={msg} />;
        }
        return <ComparisonBubble key={msg.id} data={msg} />;
      })}
      {isTyping && <TypingBubble />}
    </ScrollView>
  );
}

// ─── Bolhas ───────────────────────────────────────────────────────────────────

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
        <RivaOrb size={22} />
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
      {!!data.title && <Text style={styles.cardTitle}>{data.title}</Text>}
      <Text style={styles.bodyText}>{data.intro}</Text>
      {!!data.text && <Text style={styles.bodyText}>{data.text}</Text>}

      {data.specs.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Especificações</Text>
          <View style={styles.specsList}>
            {data.specs.map((spec, idx) => (
              <SpecRow
                key={spec.label}
                spec={spec}
                isLast={idx === data.specs.length - 1}
              />
            ))}
          </View>
        </View>
      )}

      {data.modeBadges && data.modeBadges.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Modos de condução</Text>
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
          <MaterialCommunityIcons name="cash" size={14} color={Colors.accent} />
          <Text style={styles.priceNoteText}>{data.priceNote}</Text>
        </View>
      )}

      {data.sources && data.sources.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Fontes para consultar</Text>
          <View style={styles.sourcesList}>
            {data.sources.map((s) => (
              <SourceRow key={s.url} source={s} />
            ))}
          </View>
        </View>
      )}

      {!!data.youtube?.link && (
        <TouchableOpacity
          style={styles.youtubeCard}
          activeOpacity={0.85}
          onPress={() => Linking.openURL(data.youtube!.link).catch(() => {})}
        >
          <View style={styles.youtubeThumb}>
            <Feather name="play" size={18} color="#fff" />
          </View>
          <View style={styles.youtubeBody}>
            <Text style={styles.youtubeTitle} numberOfLines={1}>
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
      {!!data.title && <Text style={styles.cardTitle}>{data.title}</Text>}
      <Text style={styles.bodyText}>{data.intro}</Text>

      {data.sides.map((side, sIdx) => (
        <View key={`${side.name}-${sIdx}`} style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>{side.name}</Text>
          <View style={styles.specsList}>
            {side.specs.map((spec, idx) => (
              <ComparisonSpecRow
                key={spec.label}
                spec={spec}
                isLast={idx === side.specs.length - 1}
              />
            ))}
          </View>
        </View>
      ))}

      {data.verdicts && data.verdicts.length > 0 && (
        <View style={styles.verdictsWrap}>
          {data.verdicts.map((v) => (
            <View
              key={v.label}
              style={[
                styles.verdictChip,
                v.variant === 'b' && styles.verdictChipAlt,
              ]}
            >
              <Text
                style={[
                  styles.verdictText,
                  v.variant === 'b' && styles.verdictTextAlt,
                ]}
              >
                {v.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {data.summary && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Resumo prático</Text>
          <View style={{ gap: 12 }}>
            {data.summary.paragraphs.map((p, i) => (
              <Text key={i} style={styles.bodyText}>{p}</Text>
            ))}
            {!!data.summary.verdict && (
              <View style={styles.verdictBox}>
                <Text style={styles.verdictBoxText}>
                  <Text style={styles.verdictBoxLabel}>Em resumo: </Text>
                  {data.summary.verdict}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {data.sources && data.sources.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Fontes para consultar</Text>
          <View style={styles.sourcesList}>
            {data.sources.map((s) => (
              <SourceRow key={s.url} source={s} />
            ))}
          </View>
        </View>
      )}
    </RivaShell>
  );
}

function RichBubble({ data }: { data: RivaRich }) {
  return (
    <RivaShell>
      {!!data.title && <Text style={styles.cardTitle}>{data.title}</Text>}
      {!!data.text && <Text style={styles.bodyText}>{data.text}</Text>}

      {data.cards && data.cards.length > 0 && (
        <View style={styles.metricGrid}>
          {data.cards.map((c) => (
            <View key={c.label} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{c.label}</Text>
              <Text style={styles.metricValue}>{c.value}</Text>
              <Text style={styles.metricSub}>{c.sub}</Text>
            </View>
          ))}
        </View>
      )}

      {data.bullets && data.bullets.length > 0 && (
        <View style={styles.bulletsList}>
          {data.bullets.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      )}

      {data.badges && data.badges.length > 0 && (
        <View style={styles.richBadgesWrap}>
          {data.badges.map((b, i) => (
            <View
              key={i}
              style={[
                styles.richBadge,
                b.type === 'success' ? styles.richBadgeSuccess : styles.richBadgeWarning,
              ]}
            >
              <Feather
                name={b.type === 'success' ? 'check' : 'alert-triangle'}
                size={11}
                color={b.type === 'success' ? '#64C864' : '#FFAA33'}
              />
              <Text
                style={[
                  styles.richBadgeText,
                  b.type === 'success' ? styles.richBadgeTextSuccess : styles.richBadgeTextWarning,
                ]}
              >
                {b.text}
              </Text>
            </View>
          ))}
        </View>
      )}

      {data.video && (
        <View style={styles.videoCard}>
          <View style={styles.videoThumb}>
            <Feather name="play" size={18} color="#fff" />
          </View>
          <View style={styles.videoBody}>
            <Text style={styles.videoTitle} numberOfLines={2}>{data.video.title}</Text>
            <Text style={styles.videoMeta} numberOfLines={1}>
              {data.video.channel} · {data.video.views} · {data.video.year}
            </Text>
          </View>
        </View>
      )}

      {data.scores && data.scores.length > 0 && (
        <View style={styles.scoresList}>
          {data.scores.map((s) => (
            <View key={s.label} style={styles.scoreRow}>
              <Text style={styles.scoreLabel} numberOfLines={1}>{s.label}</Text>
              <View style={styles.scoreBarBg}>
                <View
                  style={[
                    styles.scoreBarFill,
                    { width: `${Math.max(0, Math.min(100, s.score * 10))}%`, backgroundColor: scoreColor(s.color) },
                  ]}
                />
              </View>
              <Text style={styles.scoreValue}>{s.score.toFixed(1)}</Text>
            </View>
          ))}
        </View>
      )}

      {data.actions && data.actions.length > 0 && (
        <View style={styles.actionsWrap}>
          {data.actions.map((a, i) => (
            <View key={i} style={styles.actionChip}>
              <Text style={styles.actionText}>{a}</Text>
            </View>
          ))}
        </View>
      )}

      {data.sources && data.sources.length > 0 && (
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Fontes para consultar</Text>
          <View style={styles.sourcesList}>
            {data.sources.map((s) => (
              <SourceRow key={s.url} source={s} />
            ))}
          </View>
        </View>
      )}
    </RivaShell>
  );
}

function scoreColor(color: 'blue' | 'green' | 'orange'): string {
  if (color === 'green') return '#64C864';
  if (color === 'orange') return '#FFAA33';
  return Colors.accent;
}

// ─── Linhas internas ──────────────────────────────────────────────────────────

function SpecRow({ spec, isLast }: { spec: SpecItem; isLast: boolean }) {
  return (
    <View style={[styles.specRow, !isLast && styles.specRowDivider]}>
      <Text style={styles.specLabel}>{spec.label}</Text>
      <Text style={styles.specValue}>{spec.value}</Text>
    </View>
  );
}

function ComparisonSpecRow({ spec, isLast }: { spec: ComparisonSpec; isLast: boolean }) {
  return (
    <View style={[styles.specRow, !isLast && styles.specRowDivider]}>
      <Text style={styles.specLabel}>{spec.label}</Text>
      <View style={styles.specValueRow}>
        <Text style={[styles.specValue, spec.winner && styles.specValueWinner]}>
          {spec.value}
        </Text>
        {spec.winner && (
          <MaterialCommunityIcons
            name="check-circle"
            size={12}
            color={Colors.accent}
            style={{ marginLeft: 6 }}
          />
        )}
      </View>
    </View>
  );
}

function SourceRow({ source }: { source: SourceLink }) {
  return (
    <TouchableOpacity
      style={styles.sourceRow}
      activeOpacity={0.7}
      onPress={() => Linking.openURL(source.url).catch(() => {})}
    >
      <Text style={styles.sourceBullet}>•</Text>
      <Text style={styles.sourceEmoji}>{source.emoji}</Text>
      <Text style={styles.sourceText}>
        <Text style={styles.sourceLink}>{source.label}</Text>
        <Text style={styles.sourceDash}> — </Text>
        <Text style={styles.sourceDescription}>{source.description}</Text>
      </Text>
    </TouchableOpacity>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 24,
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
    paddingVertical: 12,
  },
  userText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Sora_400Regular',
    lineHeight: 20,
  },

  // RIVA shell
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
    gap: 16,
  },
  rivaLabel: {
    color: Colors.accent,
    fontSize: 11,
    fontFamily: 'Sora_700Bold',
    letterSpacing: 0.6,
    marginBottom: -4,
  },
  rivaLabelMuted: {
    color: Colors.textMuted,
    fontFamily: 'Sora_400Regular',
    letterSpacing: 0,
  },

  // Texto corrido
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: 'Sora_700Bold',
    letterSpacing: -0.2,
  },
  bodyText: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Sora_400Regular',
  },

  // Seções (separadas com bastante respiro)
  sectionBlock: {
    gap: 12,
  },
  sectionHeading: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_700Bold',
    letterSpacing: 0.2,
  },

  // Lista de specs (linhas com divisória)
  specsList: {},
  specRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  specRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  specLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_500Medium',
    flex: 1,
  },
  specValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  specValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
    textAlign: 'right',
    flexShrink: 1,
  },
  specValueWinner: {
    color: Colors.accent,
    fontFamily: 'Sora_600SemiBold',
  },

  // Modes
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeBadge: {
    borderRadius: Colors.radiusPill,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  modeBadgeHighlight: {
    backgroundColor: 'rgba(5,211,248,0.12)',
    borderColor: Colors.accent,
  },
  modeBadgeText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_500Medium',
  },
  modeBadgeTextHighlight: { color: Colors.accent },

  // Price note
  priceNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(5,211,248,0.06)',
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Colors.radiusMd,
  },
  priceNoteText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Sora_400Regular',
  },

  // Sources list (bullets com emoji + link)
  sourcesList: {
    gap: 12,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  sourceBullet: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  sourceEmoji: {
    fontSize: 14,
    lineHeight: 20,
  },
  sourceText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Sora_400Regular',
  },
  sourceLink: {
    color: Colors.accent,
    fontFamily: 'Sora_600SemiBold',
    textDecorationLine: 'underline',
  },
  sourceDash: {
    color: Colors.textMuted,
  },
  sourceDescription: {
    color: Colors.textSecondary,
  },

  // YouTube card
  youtubeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.inputBg,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  youtubeThumb: {
    width: 44,
    height: 44,
    borderRadius: Colors.radiusMd,
    backgroundColor: '#7A0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubeBody: { flex: 1, gap: 2 },
  youtubeTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_600SemiBold',
  },
  youtubeMeta: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
  },

  // Verdict chips
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
    fontSize: 12,
    fontFamily: 'Sora_600SemiBold',
  },
  verdictTextAlt: { color: '#E8A020' },

  // Verdict box (Em resumo)
  verdictBox: {
    backgroundColor: 'rgba(5,211,248,0.06)',
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Colors.radiusMd,
  },
  verdictBoxText: {
    color: Colors.textPrimary,
    fontSize: 13.5,
    lineHeight: 20,
    fontFamily: 'Sora_400Regular',
  },
  verdictBoxLabel: {
    fontFamily: 'Sora_700Bold',
    color: Colors.textPrimary,
  },

  // Rich — metric cards (grid 2 colunas)
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: 'rgba(5,211,248,0.06)',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusMd,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: Colors.accent,
    fontSize: 15,
    fontFamily: 'Sora_700Bold',
  },
  metricSub: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
  },

  // Rich — bullets
  bulletsList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bulletDot: {
    color: Colors.accent,
    fontSize: 14,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13.5,
    lineHeight: 20,
    fontFamily: 'Sora_400Regular',
  },

  // Rich — badges com type
  richBadgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  richBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: Colors.radiusPill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  richBadgeSuccess: {
    backgroundColor: 'rgba(100,200,100,0.1)',
    borderColor: 'rgba(100,200,100,0.3)',
  },
  richBadgeWarning: {
    backgroundColor: 'rgba(255,170,51,0.1)',
    borderColor: 'rgba(255,170,51,0.3)',
  },
  richBadgeText: {
    fontSize: 11,
    fontFamily: 'Sora_500Medium',
  },
  richBadgeTextSuccess: { color: '#64C864' },
  richBadgeTextWarning: { color: '#FFAA33' },

  // Rich — video card (sem URL)
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.inputBg,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  videoThumb: {
    width: 44,
    height: 44,
    borderRadius: Colors.radiusMd,
    backgroundColor: '#7A0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBody: { flex: 1, gap: 2 },
  videoTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Sora_600SemiBold',
  },
  videoMeta: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
  },

  // Rich — scores (barra horizontal)
  scoresList: {
    gap: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreLabel: {
    width: 110,
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: 'Sora_500Medium',
  },
  scoreBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 99,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: 6,
    borderRadius: 99,
  },
  scoreValue: {
    width: 32,
    textAlign: 'right',
    color: Colors.accent,
    fontSize: 11,
    fontFamily: 'Sora_600SemiBold',
  },

  // Rich — actions
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionChip: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: 'rgba(15,69,113,0.3)',
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    color: Colors.textSecondary,
    fontSize: 11.5,
    fontFamily: 'Sora_500Medium',
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
