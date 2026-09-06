/** Bottom sheet de detalhe do veículo — foto full-bleed e specs por abas */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Vehicle } from '../../types/vehicle';
import { Colors } from '../../theme/colors';
import { useFavoritesContext } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { useRecentlyViewedContext } from '../../context/RecentlyViewedContext';
import { useNavigation } from '../../context/NavigationContext';
import { useChat } from '../../context/ChatContext';

interface VeiculoFichaProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

type TabKey = 'capacidade' | 'offroad' | 'seguranca';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'capacidade', label: 'Capacidade' },
  { key: 'offroad', label: 'Off-road' },
  { key: 'seguranca', label: 'Segurança' },
];

export function VeiculoFicha({ vehicle, onClose }: VeiculoFichaProps) {
  const { height: screenHeight } = useWindowDimensions();
  const { isFavorite, toggle } = useFavoritesContext();
  const { isAuthenticated, requestLogin } = useAuth();
  const { trackView } = useRecentlyViewedContext();
  const { openCompareWithVehicle, navigate } = useNavigation();
  const { sendMessage } = useChat();
  const favorited = isAuthenticated && vehicle ? isFavorite(vehicle.id) : false;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [imgIndex, setImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('capacidade');

  const visible = vehicle !== null;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: visible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    if (visible && vehicle) trackView(vehicle.id);
  }, [visible]);

  useEffect(() => {
    setImgIndex(0);
    setActiveTab('capacidade');
  }, [vehicle?.id]);

  if (!vehicle) return null;

  const imagens = vehicle.imagens ?? [];
  const temVariasFotos = imagens.length > 1;

  function fotoAnterior() {
    setImgIndex((i) => (i === 0 ? imagens.length - 1 : i - 1));
  }

  function proximaFoto() {
    setImgIndex((i) => (i === imagens.length - 1 ? 0 : i + 1));
  }

  const motor = vehicle.motorizacao_desempenho;
  const cap = vehicle.capacidade;
  const dim = vehicle.dimensoes;
  const off = vehicle.off_road;
  const seg = vehicle.tecnologia_seguranca;

  const sobre = motor
    ? `${vehicle.versao}, ${vehicle.classificacao.toLowerCase()} da ${vehicle.marca.charAt(0) + vehicle.marca.slice(1).toLowerCase()}. Motor ${motor.motor} de ${motor.potencia} cv e ${motor.torque} Nm, câmbio ${motor.cambio.toLowerCase()}${off ? ` e tração 4x4 com diferencial traseiro bloqueável${/(\d+)\s*modos/i.test(off.modos_tracao) ? ` e ${off.modos_tracao.match(/(\d+)\s*modos/i)![1]} modos de condução` : ''}` : ''}.`
    : null;

  // Quebra "2H, 4H, 4HLc, 4LLc + 7 modos de condução: Normal, Eco, ..." em tags soltas.
  const modosTracaoTags = off
    ? off.modos_tracao
        .replace(/\+?\s*\d+\s*modos de condução\s*:?/i, ',')
        .split(/,| e /)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Painel */}
      <Animated.View style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} bounces={false}>
          {/* Foto full-bleed em carrossel */}
          <View style={styles.imageArea}>
            {imagens.length > 0 ? (
              <Image source={imagens[imgIndex]} style={styles.vehicleImage} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="car-side" size={80} color={Colors.action} />
              </View>
            )}

            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>{vehicle.marca.charAt(0) + vehicle.marca.slice(1).toLowerCase()}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={16} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.favButton}
              onPress={() => {
                if (isAuthenticated) {
                  toggle(vehicle.id);
                } else {
                  requestLogin({ type: 'vehicle', vehicle }, () => toggle(vehicle.id));
                }
              }}
            >
              <MaterialCommunityIcons
                name={favorited ? 'star' : 'star-outline'}
                size={17}
                color={favorited ? Colors.accent : Colors.textPrimary}
              />
            </TouchableOpacity>

            {temVariasFotos && (
              <>
                <TouchableOpacity style={[styles.imageNavButton, styles.imageNavLeft]} onPress={fotoAnterior}>
                  <Feather name="chevron-left" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.imageNavButton, styles.imageNavRight]} onPress={proximaFoto}>
                  <Feather name="chevron-right" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.imageDots}>
                  {imagens.map((_, i) => (
                    <View key={i} style={[styles.imageDot, i === imgIndex && styles.imageDotActive]} />
                  ))}
                </View>
              </>
            )}
          </View>

          <View style={styles.body}>
            {/* Identificação */}
            <Text style={styles.yearFuel}>{vehicle.ano} · {motor?.combustivel ?? '—'}</Text>
            <Text style={styles.name}>{vehicle.versao}</Text>

            {/* Identificação — sempre visível, fora das abas, sem virar bloco/card */}
            <View style={styles.identGrid}>
              <IdentItem label="Categoria" value={vehicle.categoria} />
              <IdentItem label="Versão" value={vehicle.versao} />
              <IdentItem label="Ano" value={String(vehicle.ano)} />
              <IdentItem label="Preço" value={vehicle.preco} valueAccent />
            </View>

            {/* Sobre — texto gerado a partir dos dados técnicos do veículo */}
            {sobre && (
              <View style={styles.sobreSection}>
                <Text style={styles.subsectionLabelPlain}>SOBRE</Text>
                <Text style={styles.sobreText}>{sobre}</Text>
              </View>
            )}

            {/* Ficha técnica — sempre visível, fora das abas */}
            {motor && (
              <View style={styles.fichaTecnica}>
                <View style={styles.subsectionHeader}>
                  <MaterialCommunityIcons name="clipboard-text-outline" size={14} color={Colors.accent} />
                  <Text style={styles.subsectionLabel}>FICHA TÉCNICA</Text>
                </View>
                <FichaRow label="Motor" value={motor.motor} stacked />
                <FichaRow label="Potência / Torque" value={`${motor.potencia} cv / ${motor.torque} Nm`} />
                <FichaRow label="Câmbio" value={motor.cambio} />
                <FichaRow label="0-100 km/h" value={motor.aceleracao} last />
              </View>
            )}

            {/* Abas */}
            <View style={styles.tabsRow}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Conteúdo da aba */}
            {activeTab === 'capacidade' && (
              <>
                {cap && (
                  <>
                    <View style={styles.subsectionHeader}>
                      <MaterialCommunityIcons name="truck-cargo-container" size={14} color={Colors.accent} />
                      <Text style={styles.subsectionLabel}>CAPACIDADE</Text>
                    </View>
                    <View style={styles.specsGrid}>
                      <SpecCard label="Caçamba" value={cap.capacidade_cacamba} />
                      <SpecCard label="Reboque" value={cap.capacidade_reboque} />
                    </View>
                  </>
                )}
                {dim && (
                  <>
                    <View style={styles.subsectionHeader}>
                      <MaterialCommunityIcons name="ruler-square" size={14} color={Colors.accent} />
                      <Text style={styles.subsectionLabel}>DIMENSÕES</Text>
                    </View>
                    <View style={styles.specsGrid}>
                      <SpecCard label="Comprimento" value={`${dim.comprimento} mm`} />
                      <SpecCard label="Largura" value={`${dim.largura} mm`} />
                      <SpecCard label="Altura" value={`${dim.altura} mm`} />
                      <SpecCard label="Entre-eixos" value={`${dim.entre_eixos} mm`} />
                      <SpecCard label="Vão livre" value={dim.vao_livre} />
                    </View>
                  </>
                )}
              </>
            )}

            {activeTab === 'offroad' && off && (
              <>
                <View style={styles.subsectionHeader}>
                  <MaterialCommunityIcons name="terrain" size={14} color={Colors.accent} />
                  <Text style={styles.subsectionLabel}>OFF-ROAD</Text>
                </View>
                <View style={styles.specsGrid}>
                  <SpecCard label="Ângulo de ataque" value={`${off.angulo_ataque}°`} />
                  <SpecCard label="Ângulo de saída" value={`${off.angulo_saida}°`} />
                  <SpecCard label="Ângulo de rampa" value={`${off.angulo_rampa}°`} />
                  <SpecCard label="Prof. na água" value={`${off.profundidade_agua} mm`} />
                </View>

                <View style={styles.specsGrid}>
                  <SpecCard label="Suspensão" value={off.suspensao} fullWidth />
                </View>

                {modosTracaoTags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {modosTracaoTags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagLabel}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.checkRow}>
                  <CheckItem
                    label="Diferencial traseiro bloqueável"
                    checked={/sim/i.test(off.diferencial_traseiro_bloqueavel)}
                  />
                  <CheckItem
                    label="Controle de descida"
                    checked={/sim/i.test(off.controle_descida)}
                  />
                </View>
              </>
            )}

            {activeTab === 'seguranca' && seg && (
              <>
                <View style={styles.specsGrid}>
                  <SpecCard label="Airbags" value={String(seg.airbags)} />
                  <SpecCard label="Freios" value={seg.freio_abs} />
                  <SpecCard label="Estabilidade" value={seg.controle_estabilidade} />
                  <SpecCard label="Teto solar" value={seg.teto_solar} />
                  <SpecCard label="Carregador wireless" value={seg.carregador_wireless} />
                </View>

                <View style={styles.checkRow}>
                  <CheckItem label="AEB com detecção de pedestres" checked={/sim|autônoma/i.test(seg.frenagem_automatica)} />
                  <CheckItem label="Alerta de ponto cego + tráfego cruzado traseiro" checked={/sim/i.test(seg.alerta_ponto_cego)} />
                  <CheckItem label="Cruise control adaptativo (ACC)" checked={/adaptativo|sim/i.test(seg.controle_cruzeiro)} />
                  <CheckItem label="Ar-condicionado automático dual zone" checked={/automático|sim/i.test(seg.ar_condicionado)} />
                  <CheckItem label={seg.central_multimida} checked />
                  <CheckItem label="Câmera 360° com vista superior" checked={/sim/i.test(seg.camera_360)} />
                  <CheckItem label="Assistente de faixa com correção ativa" checked={/sim/i.test(seg.assistente_faixa)} />
                  <CheckItem label="Monitoramento de pressão dos pneus (TPMS)" checked={/sim|tpms/i.test(seg.monitoracao_pneus)} />
                  <CheckItem label="Sensores de estacionamento (câmera 360°)" checked={/sim/i.test(seg.sensor_estacionamento)} />
                  <CheckItem label="Banco elétrico ajustável (motorista)" checked />
                </View>
              </>
            )}

            <View style={{ height: 12 }} />
          </View>
        </ScrollView>

        {/* Botões fixos no rodapé */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.compareButton}
            onPress={() => {
              openCompareWithVehicle(vehicle.id);
              onClose();
            }}
          >
            <MaterialCommunityIcons name="compare-horizontal" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rivaButton}
            onPress={() => {
              sendMessage(`Me conte mais sobre o ${vehicle.versao}`);
              navigate('Início');
              onClose();
            }}
          >
            <MaterialCommunityIcons name="star-four-points-outline" size={16} color="#FFFFFF" />
            <Text style={styles.rivaLabel}>Falar com RIVA</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * Linha label/valor da Ficha Técnica, com divisória embaixo (exceto a última).
 * `stacked` põe o valor embaixo do label (pra textos longos, ex: nome do motor),
 * evitando que ele vaze pra fora da tela.
 */
function FichaRow({ label, value, last, stacked }: { label: string; value: string; last?: boolean; stacked?: boolean }) {
  if (stacked) {
    return (
      <View style={[fichaRowStyles.rowStacked, !last && fichaRowStyles.rowDivider]}>
        <Text style={fichaRowStyles.label}>{label}</Text>
        <Text style={fichaRowStyles.valueStacked}>{value}</Text>
      </View>
    );
  }
  return (
    <View style={[fichaRowStyles.row, !last && fichaRowStyles.rowDivider]}>
      <Text style={fichaRowStyles.label}>{label}</Text>
      <Text style={fichaRowStyles.value} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const fichaRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  rowStacked: {
    paddingVertical: 10,
    gap: 4,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  value: {
    flexShrink: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    textAlign: 'right',
  },
  valueStacked: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    flexWrap: 'wrap',
  },
});

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <View style={checkItemStyles.container}>
      <Feather name="check-circle" size={14} color={checked ? Colors.accent : Colors.textHint} />
      <Text style={checkItemStyles.label}>{label}</Text>
    </View>
  );
}

const checkItemStyles = StyleSheet.create({
  container: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  label: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
  },
});

function SpecCard({ label, value, valueAccent, fullWidth }: { label: string; value: string; valueAccent?: boolean; fullWidth?: boolean }) {
  return (
    <View style={[specCardStyles.container, fullWidth && specCardStyles.containerFullWidth]}>
      <Text style={specCardStyles.label}>{label}</Text>
      <Text style={[specCardStyles.value, valueAccent && specCardStyles.valueAccent]}>{value}</Text>
    </View>
  );
}

/** Igual ao SpecCard, mas sem caixa/borda — só texto puro, pra info que fica fora das abas. */
function IdentItem({ label, value, valueAccent }: { label: string; value: string; valueAccent?: boolean }) {
  return (
    <View style={identItemStyles.container}>
      <Text style={identItemStyles.label}>{label}</Text>
      <Text style={[identItemStyles.value, valueAccent && identItemStyles.valueAccent]}>{value}</Text>
    </View>
  );
}

const identItemStyles = StyleSheet.create({
  container: {
    width: '47%',
    gap: 3,
  },
  label: {
    color: Colors.textHint,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
  },
  value: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  valueAccent: {
    color: Colors.accent,
  },
});

const specCardStyles = StyleSheet.create({
  container: {
    width: '47%',
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Colors.radiusMd,
    padding: 12,
    gap: 4,
  },
  containerFullWidth: {
    width: '100%',
  },
  label: {
    color: Colors.textHint,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
  },
  value: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  valueAccent: {
    color: Colors.accent,
  },
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg,
    borderTopLeftRadius: Colors.radius2xl,
    borderTopRightRadius: Colors.radius2xl,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  imageArea: {
    height: 260,
    backgroundColor: Colors.surface,
    position: 'relative',
    overflow: 'hidden',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadge: {
    position: 'absolute',
    top: 16,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  brandBadgeText: {
    color: Colors.bg,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageNavLeft: {
    left: 10,
  },
  imageNavRight: {
    right: 10,
  },
  imageDots: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    flexDirection: 'row',
    gap: 5,
  },
  imageDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  imageDotActive: {
    backgroundColor: Colors.accent,
    width: 14,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  yearFuel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    marginBottom: 16,
  },
  identGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  sobreSection: {
    marginBottom: 20,
    gap: 8,
  },
  subsectionLabelPlain: {
    color: Colors.textHint,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    fontFamily: 'Sora_600SemiBold',
  },
  sobreText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Sora_400Regular',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tag: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_500Medium',
  },
  checkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  fichaTecnica: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Colors.radiusMd,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    marginBottom: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Colors.radiusPill,
  },
  tabActive: {
    backgroundColor: Colors.action,
  },
  tabLabel: {
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: 'Sora_500Medium',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 10,
  },
  subsectionLabel: {
    color: Colors.textHint,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    fontFamily: 'Sora_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  compareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  rivaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.action,
    borderRadius: Colors.radiusPill,
    paddingVertical: 10,
  },
  rivaLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
});
