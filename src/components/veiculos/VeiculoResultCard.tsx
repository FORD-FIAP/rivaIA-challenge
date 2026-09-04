/** Card usado na listagem de resultados da tela de Veículos — foto full-width + stats rápidos */
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Vehicle } from '../../types/vehicle';
import { Colors } from '../../theme/colors';

interface VeiculoResultCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export function VeiculoResultCard({ vehicle, onPress }: VeiculoResultCardProps) {
  const imagem = vehicle.imagens?.[0];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      {/* Foto full-width com nome sobreposto */}
      <View style={styles.imageArea}>
        {imagem ? (
          <Image source={imagem} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons name="car-side" size={48} color={Colors.action} />
          </View>
        )}
        <LinearGradient
          colors={Colors.gradientPhotoFade as [string, string]}
          style={styles.imageFade}
        />
        <View style={styles.imageTextOverlay}>
          <Text style={styles.brandYear}>{vehicle.marca.charAt(0) + vehicle.marca.slice(1).toLowerCase()} · {vehicle.ano}</Text>
          <Text style={styles.name}>{vehicle.versao}</Text>
        </View>
      </View>

      <View style={styles.seeMoreRow}>
        <Text style={styles.seeMoreLabel}>Veja mais</Text>
        <Feather name="chevron-right" size={14} color={Colors.accent} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusLg,
    overflow: 'hidden',
  },
  imageArea: {
    height: 160,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  imageTextOverlay: {
    position: 'absolute',
    left: 14,
    bottom: 12,
    right: 14,
  },
  brandYear: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  seeMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  seeMoreLabel: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
});
