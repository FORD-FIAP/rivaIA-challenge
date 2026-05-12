/** Card de destaque — veículo principal da semana (Picape da semana) */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Vehicle } from '../../types/vehicle';
import { Colors } from '../../theme/colors';

interface FeaturedCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

/** Formata preço para o padrão brasileiro: R$ 459.900 */
function formatPrice(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

export function FeaturedCard({ vehicle, onPress }: FeaturedCardProps) {
  return (
    <View style={styles.container}>
      {/* Label da marca */}
      <Text style={styles.brand}>{vehicle.brand}</Text>

      {/* Placeholder ilustrativo — substitui imagem até ter assets reais */}
      <View style={styles.imageWrapper}>
        <View style={styles.iconBg}>
          <MaterialCommunityIcons name="truck" size={72} color={Colors.action} style={styles.truckIcon} />
        </View>
      </View>

      {/* Identificação */}
      <Text style={styles.yearBrand}>
        {vehicle.brand} · {vehicle.year}
      </Text>
      <Text style={styles.name}>{vehicle.name}</Text>
      <Text style={styles.engine}>{vehicle.engine}</Text>

      {/* Specs */}
      <View style={styles.specsRow}>
        <View style={styles.specItem}>
          <Text style={styles.specValue}>{vehicle.power}cv</Text>
          <Text style={styles.specLabel}>POTÊNCIA</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specValue}>{vehicle.torque}Nm</Text>
          <Text style={styles.specLabel}>TORQUE</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specValue}>{vehicle.consumption}km/l</Text>
          <Text style={styles.specLabel}>CONSUMO</Text>
        </View>
      </View>

      {/* Rodapé — preço e link */}
      <View style={styles.footer}>
        <Text style={styles.price}>{formatPrice(vehicle.price)}</Text>
        <TouchableOpacity style={styles.detailsRow} onPress={onPress}>
          <Text style={styles.detailsLink}>Ver detalhes</Text>
          <Feather name="arrow-right" size={13} color={Colors.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.hover,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusXl,
    padding: 16,
  },
  brand: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    fontFamily: 'Sora_700Bold',
  },
  imageWrapper: {
    borderRadius: Colors.radiusLg,
    marginBottom: 14,
    overflow: 'hidden',
  },
  iconBg: {
    height: 140,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  truckIcon: {
    opacity: 0.9,
  },
  yearBrand: {
    color: Colors.accent,
    fontSize: 10,
    marginBottom: 4,
    fontFamily: 'Sora_400Regular',
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: 'Sora_700Bold',
  },
  engine: {
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 16,
    fontFamily: 'Sora_400Regular',
  },
  specsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  specItem: {
    gap: 2,
  },
  specValue: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  specLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: 'Sora_400Regular',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 14,
  },
  price: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsLink: {
    color: Colors.accent,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
});
