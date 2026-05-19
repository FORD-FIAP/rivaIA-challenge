/** Tela de criação de conta / login — overlay full-screen acionado por ações que exigem autenticação */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { RivaOrb } from '../components/home/RivaOrb';
import { useAuth, AuthPromptContext } from '../context/AuthContext';
import { Vehicle } from '../types/vehicle';

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function copyForContext(ctx: AuthPromptContext): { title: string; cta: string; badge: string } {
  if (ctx.type === 'comparison') {
    return {
      title: 'Crie sua conta para salvar',
      cta: 'Criar conta e salvar comparação',
      badge: 'VOCÊ ESTÁ SALVANDO ESTA COMPARAÇÃO',
    };
  }
  if (ctx.type === 'vehicle') {
    return {
      title: 'Crie sua conta para salvar',
      cta: 'Criar conta e salvar veículo',
      badge: 'VOCÊ ESTÁ SALVANDO ESTE VEÍCULO',
    };
  }
  if (ctx.type === 'chat') {
    return {
      title: 'Crie sua conta para salvar',
      cta: 'Criar conta e salvar conversa',
      badge: 'VOCÊ ESTÁ SALVANDO ESTA CONVERSA',
    };
  }
  return {
    title: 'Crie sua conta',
    cta: 'Criar conta',
    badge: '',
  };
}

export function LoginScreen() {
  const { authPrompt, closeLogin, login, runPendingAction } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const [shouldRender, setShouldRender] = useState(false);
  const [lastPrompt, setLastPrompt] = useState(authPrompt);

  useEffect(() => {
    if (authPrompt) {
      setLastPrompt(authPrompt);
      setShouldRender(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else if (shouldRender) {
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 240,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setShouldRender(false);
      });
    }
  }, [authPrompt, screenWidth]);

  if (!shouldRender) return null;

  const activePrompt = authPrompt ?? lastPrompt;
  if (!activePrompt) return null;

  const { title, cta, badge } = copyForContext(activePrompt);
  const formValid =
    name.trim().length > 0 &&
    isValidEmail(email) &&
    password.length >= 6 &&
    agreed;

  function handleSubmit() {
    if (!formValid) return;
    login({ fullName: name, email });
    runPendingAction();
    closeLogin();
    setName(''); setEmail(''); setPassword(''); setAgreed(false);
  }

  return (
    <Animated.View
      style={[styles.overlay, { transform: [{ translateX: slideAnim }] }]}
      pointerEvents={authPrompt ? 'auto' : 'none'}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={closeLogin}>
            <Feather name="x" size={18} color={Colors.textPrimary} />
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Orb */}
          <View style={styles.orbWrapper}>
            <RivaOrb />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Volte a esta {activePrompt.type === 'comparison' ? 'comparação' : activePrompt.type === 'vehicle' ? 'análise' : 'experiência'} de qualquer dispositivo, com a análise completa da RIVA.
          </Text>

          <View style={styles.divider} />

          {/* Preview do contexto */}
          {activePrompt.type === 'comparison' && (
            <View style={styles.contextCard}>
              <View style={styles.contextBadgeRow}>
                <MaterialCommunityIcons name="swap-horizontal" size={12} color={Colors.accent} />
                <Text style={styles.contextBadge}>{badge}</Text>
              </View>
              <View style={styles.pairRow}>
                <VehicleMini vehicle={activePrompt.vehicleA} accent={Colors.accent} />
                <Text style={styles.vsLabel}>VS</Text>
                <VehicleMini vehicle={activePrompt.vehicleB} accent="#7B6FE8" />
              </View>
              <Text style={styles.contextFooter}>13 atributos analisados pela RIVA</Text>
            </View>
          )}

          {activePrompt.type === 'vehicle' && (
            <View style={styles.contextCard}>
              <View style={styles.contextBadgeRow}>
                <MaterialCommunityIcons name="star-outline" size={12} color={Colors.accent} />
                <Text style={styles.contextBadge}>{badge}</Text>
              </View>
              <View style={styles.singleRow}>
                <VehicleMini vehicle={activePrompt.vehicle} accent={Colors.accent} />
              </View>
              <Text style={styles.contextFooter}>{activePrompt.vehicle.preco}</Text>
            </View>
          )}

          {/* Botão Google */}
          <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85}>
            <AntDesign name="google" size={16} color="#EA4335" />
            <Text style={styles.socialLabel}>Continuar com Google</Text>
          </TouchableOpacity>

          {/* Divisor "OU" */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orLabel}>OU</Text>
            <View style={styles.orLine} />
          </View>

          {/* Formulário */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Feather name="user" size={12} color={Colors.accent} />
              <Text style={styles.fieldLabel}>Nome completo</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Como podemos te chamar?"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

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

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Feather name="lock" size={12} color={Colors.accent} />
              <Text style={styles.fieldLabel}>Senha</Text>
              <Text style={styles.fieldHint}>· Mínimo 6 caracteres</Text>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={14} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Termos */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreed((a) => !a)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Feather name="check" size={11} color={Colors.bg} />}
            </View>
            <Text style={styles.termsText}>
              Concordo com os <Text style={styles.termsLink}>Termos</Text> e{' '}
              <Text style={styles.termsLink}>Política de Privacidade</Text>
            </Text>
          </TouchableOpacity>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cta, !formValid && styles.ctaDisabled]}
            disabled={!formValid}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaLabel, !formValid && styles.ctaLabelDisabled]}>
              {cta}
            </Text>
            <Feather name="chevron-right" size={16} color={!formValid ? Colors.textMuted : Colors.textPrimary} />
          </TouchableOpacity>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Já tem conta? </Text>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

function VehicleMini({ vehicle, accent }: { vehicle: Vehicle; accent: string }) {
  return (
    <View style={styles.miniCard}>
      <Text style={[styles.miniBrand, { color: accent }]}>{vehicle.marca.toUpperCase()}</Text>
      <View style={styles.miniImage}>
        <MaterialCommunityIcons name="car-side" size={36} color={accent} />
      </View>
      <Text style={styles.miniName} numberOfLines={1}>{vehicle.modelo}</Text>
      <Text style={styles.miniVersion} numberOfLines={1}>{vehicle.versao}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.bg,
    zIndex: 50,
  },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  closeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  closeText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_500Medium',
  },
  stepText: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: 'Sora_600SemiBold',
  },

  scroll: { paddingHorizontal: 24, paddingTop: 16 },

  orbWrapper: { alignItems: 'center', marginBottom: 16 },

  title: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontFamily: 'Sora_700Bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    textAlign: 'center',
    lineHeight: 18,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },

  // Contexto
  contextCard: {
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: 14,
    marginBottom: 18,
  },
  contextBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  contextBadge: {
    color: Colors.accent,
    fontSize: 10,
    letterSpacing: 0.8,
    fontFamily: 'Sora_700Bold',
  },
  pairRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  singleRow: { alignItems: 'center' },
  vsLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Sora_700Bold',
  },
  contextFooter: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
    marginTop: 10,
  },
  miniCard: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Colors.radiusMd,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  miniBrand: {
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: 'Sora_700Bold',
  },
  miniImage: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  miniName: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontFamily: 'Sora_700Bold',
  },
  miniVersion: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'Sora_400Regular',
  },

  // Social
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusMd,
    paddingVertical: 13,
    marginBottom: 12,
  },
  socialLabel: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_600SemiBold',
  },

  // OU
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 1,
  },

  // Form
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
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 4, position: 'relative' },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },

  // Termos
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 6,
    marginBottom: 18,
  },
  checkbox: {
    width: 16, height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  termsText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    lineHeight: 18,
  },
  termsLink: { color: Colors.accent },

  // CTA
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.action,
    borderRadius: Colors.radiusMd,
    paddingVertical: 14,
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

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
  },
  loginLink: {
    color: Colors.accent,
    fontSize: 12,
    fontFamily: 'Sora_700Bold',
  },
});
