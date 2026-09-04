/** Tela de Perfil — exibe dados do usuário logado, permite editar nickname/email e preferências. */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

const DISABLED_TOOLTIP = 'Botão atualmente desativado';

type DisabledKey = 'notif' | 'config' | 'support';

const DISABLED_ITEMS: { key: DisabledKey; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { key: 'notif',   label: 'Notificações',  icon: 'bell'          },
  { key: 'config',  label: 'Configuração',  icon: 'settings'      },
  { key: 'support', label: 'Suporte',       icon: 'help-circle'   },
];

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const { navigate } = useNavigation();

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [preferences, setPreferences] = useState(user?.preferences ?? '');
  const [hovered, setHovered] = useState<DisabledKey | null>(null);

  if (!user) return null;

  const nicknameDirty = nickname.trim() !== user.nickname;
  const emailDirty = email.trim() !== user.email;
  const prefsDirty = preferences !== user.preferences;
  const dirty = nicknameDirty || emailDirty || prefsDirty;
  const canSave =
    dirty &&
    nickname.trim().length > 0 &&
    isValidEmail(email);

  function handleSave() {
    if (!canSave) return;
    updateProfile({
      nickname: nickname.trim(),
      email: email.trim(),
      preferences,
    });
  }

  function handleLogout() {
    logout();
    navigate('Início');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('Início')} style={styles.backBtn}>
          <Feather name="chevron-left" size={20} color={Colors.textPrimary} />
          <Text style={styles.backLabel}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="log-out" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Nome completo */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Feather name="user" size={12} color={Colors.accent} />
            <Text style={styles.fieldLabel}>Nome completo</Text>
            <Text style={styles.fieldHint}>· definido no cadastro</Text>
          </View>
          <View style={[styles.input, styles.inputReadonly]}>
            <Text style={styles.inputReadonlyText}>{user.fullName}</Text>
          </View>
        </View>

        {/* Nickname */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Feather name="smile" size={12} color={Colors.accent} />
            <Text style={styles.fieldLabel}>Nickname</Text>
            <Text style={styles.fieldHint}>· como a RIVA vai te chamar</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Como prefere ser chamado?"
            placeholderTextColor={Colors.textMuted}
            value={nickname}
            onChangeText={setNickname}
          />
        </View>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Feather name="mail" size={12} color={Colors.accent} />
            <Text style={styles.fieldLabel}>E-mail</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Preferências */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Feather name="heart" size={12} color={Colors.accent} />
            <Text style={styles.fieldLabel}>Suas preferências</Text>
          </View>
          <TextInput
            style={[styles.input, styles.prefsInput]}
            placeholder="Ex.: gosto de picapes Ford e Toyota, prefiro motor diesel"
            placeholderTextColor={Colors.textMuted}
            value={preferences}
            onChangeText={setPreferences}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Botão salvar */}
        <TouchableOpacity
          style={[styles.cta, !canSave && styles.ctaDisabled]}
          disabled={!canSave}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Feather name="check" size={16} color={!canSave ? Colors.textMuted : Colors.textPrimary} />
          <Text style={[styles.ctaLabel, !canSave && styles.ctaLabelDisabled]}>
            Salvar alterações
          </Text>
        </TouchableOpacity>

        {/* Botões desativados */}
        <View style={styles.disabledGroup}>
          {DISABLED_ITEMS.map((item) => {
            const isHovered = hovered === item.key;
            return (
              <View key={item.key} style={styles.disabledWrapper}>
                <Pressable
                  // @ts-expect-error Pressable.onHoverIn/Out existem em RN-web
                  onHoverIn={() => setHovered(item.key)}
                  onHoverOut={() => setHovered((h) => (h === item.key ? null : h))}
                  // No nativo (sem hover), o toque também revela a mensagem.
                  onPress={() => setHovered((h) => (h === item.key ? null : item.key))}
                  // Web: title nativo do navegador como fallback de acessibilidade.
                  {...(Platform.OS === 'web' ? { accessibilityLabel: DISABLED_TOOLTIP } : {})}
                  style={({ hovered: rnHovered }: any) => [
                    styles.disabledRow,
                    (isHovered || rnHovered) && styles.disabledRowHovered,
                  ]}
                >
                  <Feather name={item.icon} size={16} color={Colors.textMuted} />
                  <Text style={styles.disabledLabel}>{item.label}</Text>
                  <Feather name="lock" size={12} color={Colors.textHint} />
                </Pressable>
                {isHovered && (
                  <View style={styles.tooltip} pointerEvents="none">
                    <Text style={styles.tooltipText}>{DISABLED_TOOLTIP}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backLabel: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_500Medium',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontFamily: 'Sora_700Bold',
  },

  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  avatarBlock: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.action,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarLetter: {
    color: Colors.textPrimary,
    fontSize: 30,
    fontFamily: 'Sora_700Bold',
  },
  helloName: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontFamily: 'Sora_700Bold',
  },
  helloEmail: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
  },

  fieldGroup: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  fieldLabel: {
    color: Colors.accent,
    fontSize: 12,
    fontFamily: 'Sora_600SemiBold',
  },
  fieldHint: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  inputReadonly: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderStyle: 'dashed',
  },
  inputReadonlyText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },

  prefsBox: {
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  prefsHelper: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    lineHeight: 18,
    marginBottom: 10,
  },
  prefsInput: {
    minHeight: 90,
    paddingTop: 12,
  },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.action,
    borderRadius: Colors.radiusPill,
    paddingVertical: 14,
    marginBottom: 24,
  },
  ctaDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ctaLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Sora_700Bold',
  },
  ctaLabelDisabled: { color: Colors.textMuted },

  disabledGroup: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  disabledWrapper: {
    position: 'relative',
  },
  disabledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: Colors.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
    opacity: 0.55,
    ...(Platform.OS === 'web' ? ({ cursor: 'not-allowed' } as any) : null),
  },
  disabledRowHovered: {
    opacity: 0.75,
    borderColor: Colors.borderStrong,
  },
  disabledLabel: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Sora_500Medium',
  },
  tooltip: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusSm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  tooltipText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontFamily: 'Sora_500Medium',
  },
});
