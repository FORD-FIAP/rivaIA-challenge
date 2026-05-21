/** Bottom sheet de detalhe do veículo — Especificações, Score RIVA e Ficha Técnica */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
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

interface VeiculoFichaProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

function formatPrice(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

const SCORE_LABELS: { key: keyof NonNullable<Vehicle['scores']>; label: string }[] = [
  { key: 'performance', label: 'Performance' },
  { key: 'conforto',    label: 'Conforto'    },
  { key: 'offRoad',     label: 'Off-road'    },
  { key: 'economia',    label: 'Economia'    },
  { key: 'tecnologia',  label: 'Tecnologia'  },
  { key: 'seguranca',   label: 'Segurança'   },
];

export function VeiculoFicha({ vehicle, onClose }: VeiculoFichaProps) {
  const { height: screenHeight } = useWindowDimensions();
  const { isFavorite, toggle } = useFavoritesContext();
  const { isAuthenticated, requestLogin } = useAuth();
  const { trackView } = useRecentlyViewedContext();
  const favorited = isAuthenticated && vehicle ? isFavorite(vehicle.id) : false;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

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

  if (!vehicle) return null;

  const motor = vehicle.motorizacao_desempenho;
  const cap = vehicle.capacidade;
  const dim = vehicle.dimensoes;
  const off = vehicle.off_road;
  const seg = vehicle.tecnologia_seguranca;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Painel */}
      <Animated.View style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}>
        {/* Cabeçalho fixo */}
        <View style={styles.sheetHeader}>
          <View style={styles.sheetHeaderLeft}>
            <Text style={styles.sheetBrandYear}>{vehicle.marca} · {vehicle.ano}</Text>
            <Text style={styles.sheetName}>{vehicle.versao}</Text>
          </View>
          <View style={styles.sheetHeaderActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                if (isAuthenticated) {
                  toggle(vehicle!.id);
                } else {
                  requestLogin(
                    { type: 'vehicle', vehicle: vehicle! },
                    () => toggle(vehicle!.id),
                  );
                }
              }}
            >
              <MaterialCommunityIcons
                name={favorited ? 'star' : 'star-outline'}
                size={17}
                color={favorited ? Colors.accent : Colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Feather name="x" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {/* Imagem */}
          <View style={styles.imageArea}>
            <Text style={styles.imageBrand}>{vehicle.marca}</Text>
            <MaterialCommunityIcons name="truck" size={100} color={Colors.action} style={styles.truckIcon} />
          </View>

          {/* Especificações */}
          {motor && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>ESPECIFICAÇÕES</Text>
              <View style={styles.specsGrid}>
                <SpecBox label="POTÊNCIA" value={motor.potencia} unit="cv" />
                <SpecBox label="TORQUE" value={motor.torque} unit="Nm" />
                <SpecBox label="0-100 KM/H" value={motor.aceleracao.replace(/.*?(\d[\d,]+s)$/, '$1')} unit="" />
                <SpecBox label="COMBUSTÍVEL" value={motor.combustivel} unit="" />
              </View>
            </View>
          )}

          {/* Score RIVA */}
          {vehicle.scores && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SCORE RIVA</Text>
              {SCORE_LABELS.map(({ key, label }) =>
                vehicle.scores![key] != null ? (
                  <ScoreRow key={key} label={label} value={vehicle.scores![key]!} />
                ) : null
              )}
            </View>
          )}

          {/* Ficha Técnica */}
          <View style={[styles.section, styles.lastSection]}>
            {/* Motorização */}
            {motor && (
              <>
                <Text style={styles.sectionLabel}>MOTORIZAÇÃO E DESEMPENHO</Text>
                <View style={styles.specsList}>
                  <SpecLine label="Motor" value={motor.motor} />
                  <SpecLine label="Cilindros" value={motor.cilindros} />
                  <SpecLine label="Câmbio" value={motor.cambio} />
                  <SpecLine label="Tanque" value={motor.tanque} />
                  <SpecLine label="Combustível" value={motor.combustivel} />
                  <SpecLine label="Vel. máxima" value={motor.velocidade_max} />
                  <SpecLine label="Aceleração" value={motor.aceleracao} />
                </View>
              </>
            )}

            {/* Capacidade */}
            {cap && (
              <>
                <Text style={[styles.sectionLabel, styles.sectionLabelTop]}>CAPACIDADE DE CARGA E REBOQUE</Text>
                <View style={styles.specsList}>
                  <SpecLine label="Caçamba" value={cap.capacidade_cacamba} />
                  <SpecLine label="Reboque" value={cap.capacidade_reboque} />
                </View>
              </>
            )}

            {/* Dimensões */}
            {dim && (
              <>
                <Text style={[styles.sectionLabel, styles.sectionLabelTop]}>DIMENSÕES</Text>
                <View style={styles.specsList}>
                  <SpecLine label="Comprimento" value={`${dim.comprimento} mm`} />
                  <SpecLine label="Largura" value={`${dim.largura} mm`} />
                  <SpecLine label="Altura" value={`${dim.altura} mm`} />
                  <SpecLine label="Entre eixos" value={`${dim.entre_eixos} mm`} />
                  <SpecLine label="Vão livre" value={dim.vao_livre} />
                </View>
              </>
            )}

            {/* Off-road */}
            {off && (
              <>
                <Text style={[styles.sectionLabel, styles.sectionLabelTop]}>OFF-ROAD</Text>
                <View style={styles.specsList}>
                  <SpecLine label="Modos de tração" value={off.modos_tracao} />
                  <SpecLine label="Diferencial bloqueável" value={off.diferencial_traseiro_bloqueavel} />
                  <SpecLine label="Ângulo de ataque" value={`${off.angulo_ataque}°`} />
                  <SpecLine label="Ângulo de saída" value={`${off.angulo_saida}°`} />
                  <SpecLine label="Ângulo de rampa" value={`${off.angulo_rampa}°`} />
                  <SpecLine label="Prof. na água" value={`${off.profundidade_agua} mm`} />
                  <SpecLine label="Suspensão" value={off.suspensao} />
                  <SpecLine label="Controle de descida" value={off.controle_descida} />
                </View>
              </>
            )}

            {/* Tecnologia e Segurança */}
            {seg && (
              <>
                <Text style={[styles.sectionLabel, styles.sectionLabelTop]}>TECNOLOGIA E SEGURANÇA</Text>
                <View style={styles.specsList}>
                  <SpecLine label="Airbags" value={`${seg.airbags} airbags`} />
                  <SpecLine label="Freios" value={seg.freio_abs} />
                  <SpecLine label="Estabilidade" value={seg.controle_estabilidade} />
                  <SpecLine label="Frenagem aut." value={seg.frenagem_automatica} />
                  <SpecLine label="Ponto cego" value={seg.alerta_ponto_cego} />
                  <SpecLine label="Cruzeiro" value={seg.controle_cruzeiro} />
                  <SpecLine label="Multimídia" value={seg.central_multimida} />
                  <SpecLine label="Câmera 360°" value={seg.camera_360} />
                  <SpecLine label="Assist. de faixa" value={seg.assistente_faixa} />
                  <SpecLine label="Monitor. pneus" value={seg.monitoracao_pneus} />
                  <SpecLine label="Teto solar" value={seg.teto_solar} />
                  <SpecLine label="Estacionamento" value={seg.sensor_estacionamento} />
                  <SpecLine label="Carregador Wi." value={seg.carregador_wireless} />
                  <SpecLine label="Banco" value={seg.ajuste_banco} />
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Botões fixos no rodapé */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.compareButton}>
            <MaterialCommunityIcons name="swap-vertical" size={16} color={Colors.textPrimary} />
            <Text style={styles.compareLabel}>Comparar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rivaButton}>
            <MaterialCommunityIcons name="star-four-points-outline" size={16} color={Colors.surface} />
            <Text style={styles.rivaLabel}>Falar com RIVA</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

function SpecBox({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={specBoxStyles.container}>
      <Text style={specBoxStyles.label}>{label}</Text>
      <Text style={specBoxStyles.value}>
        {value}<Text style={specBoxStyles.unit}> {unit}</Text>
      </Text>
    </View>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={scoreStyles.row}>
      <Text style={scoreStyles.label}>{label}</Text>
      <View style={scoreStyles.barTrack}>
        <View style={[scoreStyles.barFill, { width: `${(value / 10) * 100}%` as any }]} />
      </View>
      <Text style={scoreStyles.value}>{value.toFixed(1)}</Text>
    </View>
  );
}

function SpecLine({ label, value }: { label: string; value: string }) {
  return (
    <Text style={specLineStyles.text}>
      <Text style={specLineStyles.label}>{label}: </Text>
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
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
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetHeaderLeft: {
    gap: 2,
  },
  sheetBrandYear: {
    color: Colors.accent,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
    letterSpacing: 0.3,
  },
  sheetName: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  sheetHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: Colors.radiusPill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  imageArea: {
    height: 180,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  imageBrand: {
    position: 'absolute',
    top: 14,
    left: 20,
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: 'Sora_700Bold',
  },
  truckIcon: {
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastSection: {
    borderBottomWidth: 0,
    paddingBottom: 20,
  },
  sectionLabel: {
    color: Colors.textHint,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    fontFamily: 'Sora_600SemiBold',
    marginBottom: 14,
  },
  sectionLabelTop: {
    marginTop: 24,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  specsList: {
    gap: 8,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusPill,
    paddingVertical: 10,
  },
  compareLabel: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  rivaButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: Colors.radiusPill,
    paddingVertical: 10,
  },
  rivaLabel: {
    color: Colors.surface,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
});

const specBoxStyles = StyleSheet.create({
  container: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Colors.radiusMd,
    padding: 12,
    gap: 6,
  },
  label: {
    color: Colors.textHint,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: 'Sora_600SemiBold',
  },
  value: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  unit: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Sora_400Regular',
  },
});

const scoreStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
    width: 90,
  },
  barTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Colors.radiusPill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Colors.radiusPill,
  },
  value: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
    width: 30,
    textAlign: 'right',
  },
});

const specLineStyles = StyleSheet.create({
  text: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
    lineHeight: 20,
  },
  label: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
});