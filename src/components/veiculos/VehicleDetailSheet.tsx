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

interface VehicleDetailSheetProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

function formatPrice(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

const SCORE_LABELS: { key: keyof NonNullable<Vehicle['scores']>; label: string }[] = [
  { key: 'performance', label: 'Performance' },
  { key: 'conforto',    label: 'Conforto'    },
  { key: 'economia',    label: 'Economia'    },
  { key: 'offRoad',     label: 'Off-road'    },
  { key: 'tecnologia',  label: 'Tecnologia'  },
  { key: 'seguranca',   label: 'Segurança'   },
];

export function VehicleDetailSheet({ vehicle, onClose }: VehicleDetailSheetProps) {
  const { height: screenHeight } = useWindowDimensions();
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
  }, [visible]);

  if (!vehicle) return null;

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
            <Text style={styles.sheetBrandYear}>{vehicle.brand} · {vehicle.year}</Text>
            <Text style={styles.sheetName}>{vehicle.name}</Text>
          </View>
          <View style={styles.sheetHeaderActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="star" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Feather name="x" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {/* Imagem */}
          <View style={styles.imageArea}>
            <Text style={styles.imageBrand}>{vehicle.brand}</Text>
            <MaterialCommunityIcons name="truck" size={100} color={Colors.action} style={styles.truckIcon} />
          </View>

          {/* Especificações */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ESPECIFICAÇÕES</Text>
            <View style={styles.specsGrid}>
              <SpecBox label="POTÊNCIA" value={`${vehicle.power}`} unit="cv" />
              <SpecBox label="TORQUE" value={`${vehicle.torque}`} unit="Nm" />
              {vehicle.acceleration != null && (
                <SpecBox label="0-100 KM/H" value={`${vehicle.acceleration}`} unit="s" />
              )}
              <SpecBox label="CONSUMO" value={`${vehicle.consumption}`} unit="km/l" />
            </View>
          </View>

          {/* Score RIVA */}
          {vehicle.scores && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SCORE RIVA</Text>
              {SCORE_LABELS.map(({ key, label }) => (
                <ScoreRow key={key} label={label} value={vehicle.scores![key]} />
              ))}
            </View>
          )}

          {/* Ficha Técnica - Picape*/}
          {vehicle.specs && (
            <View style={[styles.section, styles.lastSection]}>
              <Text style={styles.sectionLabel}>MOTORIZAÇÃO E DESEMPENHO</Text>
              <View style={styles.specsList}>
                <SpecLine label="Motor" value={vehicle.engine} />
                {/* <SpecLine label="Potência" value={} />
                <SpecLine label="Torque" value={} /> */}
                <SpecLine label="Câmbio" value={vehicle.specs.cambio} />
                <SpecLine label="Tração" value={vehicle.specs.tracao} />
                {/* <SpecLine label="Tanque" value={} /> */}
                <SpecLine label="Combustível" value={vehicle.specs.combustivel} />
              </View>
              
              {/*Adicionar depois +informações para ficha técnica*/}
              <Text style={styles.sectionLabel}>CAPACIDADE DE CARGA E REBOQUE</Text>
              <View style={styles.specsList}>
                {/* <SpecLine label="Capacidade de Carga" value={} /> */}
                {/* <SpecLine label="Capacidade de Reboque" value={} /> */}
              </View>

              <Text style={styles.sectionLabel}>DIMENSÕES</Text>
              <View style={styles.specsList}>
                {/* <SpecLine label="Comprimento" value={} /> */}
                {/* <SpecLine label="Largura" value={} /> */}
                {/* <SpecLine label="Altura" value={} /> */}
                {/* <SpecLine label="Entre eixos" value={} /> */}
                {/* <SpecLine label="Classificação" value={} /> */} {/* Qual é o tamanho da picape */}
              </View>

              <Text style={styles.sectionLabel}>OFF-ROAD</Text>
              <View style={styles.specsList}>
                {/* <SpecLine label="" value={} /> */}
                {/* <SpecLine label="" value={} /> */}
              </View>

              <Text style={styles.sectionLabel}>EQUIPAMENTOS DE SEGURANÇA</Text>
              <View style={styles.specsList}>
                {/* <SpecLine label="" value={} /> */}
                {/* <SpecLine label="" value={} /> */}
              </View>

            </View>
          )}
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