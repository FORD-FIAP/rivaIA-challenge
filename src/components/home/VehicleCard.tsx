/** Card de veículo para o grid de 2 colunas — "Veículos mais analisados" */
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
      {/* Imagem */}
      <View style={styles.imageWrapper}>
        <Text style={styles.brand}>{vehicle.brand}</Text>
        <Image source={vehicle.image} style={styles.image} resizeMode="contain" />
      </View>

      {/* Informações */}
      <Text style={styles.name}>{vehicle.name}</Text>
      <Text style={styles.engineLine}>
        {vehicle.engine} · {vehicle.year}
      </Text>
      <Text style={styles.price}>{formatPrice(vehicle.price)}</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Feather name="zap" size={10} color={Colors.accent} />
          <Text style={styles.statText}>{vehicle.power} cv</Text>
        </View>
        <View style={styles.stat}>
          <Feather name="droplet" size={10} color={Colors.accent} />
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
  },
  imageWrapper: {
    backgroundColor: 'rgba(11,30,52,0.5)',
    borderRadius: Colors.radiusMd,
    padding: 8,
    marginBottom: 10,
  },
  brand: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: 'Sora_700Bold',
  },
  image: {
    width: '100%',
    height: 72,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Sora_600SemiBold',
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
