/** Bottom sheet de filtros da tela de Veículos — sobe de baixo, cobrindo a tela */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getFipeBrands, FipeBrand } from '../../services/fipeApi';
import { FilterSheetHeader, FilterClearLabel, FilterChipRow, FilterChip } from '../shared/FilterChips';

export interface FilterState {
  brands: string[];
}

export const EMPTY_FILTERS: FilterState = {
  brands: [],
};

interface FilterSheetProps {
  visible: boolean;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose: () => void;
}

export function FilterSheet({ visible, filters, onChange, onClose }: FilterSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [brands, setBrands] = useState<FipeBrand[]>([]);

  useEffect(() => {
    if (visible && brands.length === 0) {
      getFipeBrands().then((result) => {
        if (result) setBrands([...result].sort((a, b) => a.nome.localeCompare(b.nome)));
      });
    }
  }, [visible]);

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

  const temFiltrosAtivos = filters.brands.length > 0;

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((i) => i !== value) : [...list, value];
  }

  function toggleBrand(brand: string) {
    onChange({ brands: toggle(filters.brands, brand) });
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Painel que sobe de baixo */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <FilterSheetHeader
          title="Filtro"
          onClose={onClose}
          rightExtra={temFiltrosAtivos ? <FilterClearLabel onPress={() => onChange(EMPTY_FILTERS)} /> : undefined}
        />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          <FilterChipRow label="Marca">
            {brands.map((brand) => (
              <FilterChip
                key={brand.valor}
                label={brand.nome}
                active={filters.brands.includes(brand.nome)}
                onPress={() => toggleBrand(brand.nome)}
              />
            ))}
          </FilterChipRow>

          <View style={{ height: 12 }} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.viewButton} onPress={onClose}>
            <Text style={styles.viewLabel}>VER RESULTADOS</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg,
    borderTopLeftRadius: Colors.radius2xl,
    borderTopRightRadius: Colors.radius2xl,
    maxHeight: '85%',
    paddingTop: 20,
  },
  scroll: {},
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewButton: {
    flex: 1,
    backgroundColor: Colors.action,
    borderRadius: Colors.radiusPill,
    paddingVertical: 15,
    alignItems: 'center',
  },
  viewLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Sora_700Bold',
  },
});
