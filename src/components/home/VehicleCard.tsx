/** Card de veículo para o grid de 2 colunas — "Veículos mais analisados" */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Vehicle } from '../../types/vehicle';
import { Colors } from '../../theme/colors';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

/** Formata preço para o padrão brasileiro: R$ 239.900 */
function formatPrice(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

export function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Placeholder ilustrativo — substitui imagem até ter assets reais */}
      <View style={styles.iconWrapper}>
        <Text style={styles.brand}>{vehicle.brand}</Text>
        <MaterialCommunityIcons name="truck" size={40} color={Colors.action} style={styles.truckIcon} />
      </View>

      {/* Nome — 2 linhas máximo para manter altura igual */}
      <Text style={styles.name} numberOfLines={2}>{vehicle.name}</Text>

      <Text style={styles.engineLine} numberOfLines={1}>
        {vehicle.engine} · {vehicle.year}
      </Text>

      <Text style={styles.price}>{formatPrice(vehicle.price)}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Feather name="zap" size={10} color={Colors.accent} />
          <Text style={styles.statText}>{vehicle.power} cv</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="water-outline" size={11} color={Colors.accent} />
          <Text style={styles.statText}>{vehicle.consumption} km/l</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.hover,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusLg,
    padding: 12,
    minHeight: 220,
    justifyContent: 'space-between',
  },
  iconWrapper: {
    backgroundColor: Colors.surface2,
    borderRadius: Colors.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  brand: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
    alignSelf: 'flex-start',
    fontFamily: 'Sora_700Bold',
  },
  truckIcon: {
    opacity: 0.85,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Sora_600SemiBold',
    minHeight: 34,
  },
  engineLine: {
    color: Colors.textMuted,
    fontSize: 10,
    marginBottom: 6,
    fontFamily: 'Sora_400Regular',
  },
  price: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Sora_700Bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'Sora_400Regular',
  },
});
