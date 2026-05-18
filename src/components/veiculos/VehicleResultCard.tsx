/** Card compacto usado na listagem de resultados da tela de Veículos */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Vehicle } from '../../types/vehicle';
import { Colors } from '../../theme/colors';
interface VehicleResultCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export function VehicleResultCard({ vehicle, onPress }: VehicleResultCardProps) {
  const motor = vehicle.motorizacao_desempenho;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      {/* Área da imagem */}
      <View style={styles.imageArea}>
        <MaterialCommunityIcons name="truck" size={56} color={Colors.action} />
      </View>

      {/* Informações */}
      <View style={styles.info}>
        <Text style={styles.brandYear}>{vehicle.marca} · {vehicle.ano}</Text>

        <Text style={styles.name}>{vehicle.versao}</Text>
        <Text style={styles.engine}>{motor?.motor}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>{vehicle.preco}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Feather name="zap" size={10} color={Colors.textMuted} />
              <Text style={styles.statText}>{motor?.potencia} cv</Text>
            </View>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="water-outline" size={11} color={Colors.textMuted} />
              <Text style={styles.statText}>{motor?.combustivel}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.hover,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusLg,
    overflow: 'hidden',
  },
  imageArea: {
    width: 100,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingVertical: 12,
  },
  info: {
    flex: 1,
    padding: 12,
    gap: 2,
    justifyContent: 'center',
  },
  brandYear: {
    color: Colors.accent,
    fontSize: 10,
    letterSpacing: 0.3,
    fontFamily: 'Sora_400Regular',
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  engine: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
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
