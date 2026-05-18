/** Bottom sheet de filtros da tela de Veículos */
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
import { Colors } from '../../theme/colors';
import { VehicleCategory } from '../../types/vehicle';
import { vehicles, featuredVehicle } from '../../mock/vehicles';

export interface FilterState {
  brands: string[];
  models: string[];
  categories: VehicleCategory[];
  years: number[];
}

export const EMPTY_FILTERS: FilterState = {
  brands: [],
  models: [],
  categories: [],
  years: [],
};

const ALL_VEHICLES = [featuredVehicle, ...vehicles];

const ALL_BRANDS = [...new Set(ALL_VEHICLES.map((v) => v.marca))];
const ALL_YEARS   = [...new Set(ALL_VEHICLES.map((v) => v.ano))].sort((a, b) => b - a);

interface FilterModalProps {
  visible: boolean;
  applied: FilterState;
  onApply: (filters: FilterState) => void;
  onClose: () => void;
}

export function FilterModal({ visible, applied, onApply, onClose }: FilterModalProps) {
  const { height: screenHeight } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [pending, setPending] = useState<FilterState>(applied);

  useEffect(() => {
    if (visible) setPending(applied);
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

  const filteredByBrand = pending.brands.length > 0
    ? ALL_VEHICLES.filter((v) => pending.brands.includes(v.marca))
    : ALL_VEHICLES;

  const availableCategories = [...new Set(filteredByBrand.map((v) => v.categoria))] as VehicleCategory[];

  const filteredByBrandAndCategory = pending.categories.length > 0
    ? filteredByBrand.filter((v) => pending.categories.includes(v.categoria))
    : filteredByBrand;

  const availableModels = [...new Set(filteredByBrandAndCategory.map((v) => v.modelo))];

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((i) => i !== value) : [...list, value];
  }

  function toggleBrand(brand: string) {
    const next = toggle(pending.brands, brand);
    const filtered = next.length > 0 ? ALL_VEHICLES.filter((v) => next.includes(v.marca)) : ALL_VEHICLES;
    const validCategories = pending.categories.filter((c) => filtered.some((v) => v.categoria === c));
    const validModels = pending.models.filter((m) => filtered.some((v) => v.modelo === m));
    setPending({ ...pending, brands: next, categories: validCategories, models: validModels });
  }

  const totalSelected =
    pending.brands.length +
    pending.models.length +
    pending.categories.length +
    pending.years.length;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Painel deslizante */}
      <Animated.View style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        <Text style={styles.title}>Qual carro você deseja ver?</Text>
        <Text style={styles.subtitle}>Escolha um ou mais filtros para refinar sua busca</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          <FilterSection label="MARCA">
            {ALL_BRANDS.map((brand) => (
              <Chip
                key={brand}
                label={brand.charAt(0) + brand.slice(1).toLowerCase()}
                active={pending.brands.includes(brand)}
                onPress={() => toggleBrand(brand)}
              />
            ))}
          </FilterSection>

          <FilterSection label="CATEGORIA">
            {availableCategories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                active={pending.categories.includes(cat)}
                onPress={() => setPending({ ...pending, categories: toggle(pending.categories, cat) })}
              />
            ))}
          </FilterSection>

          <FilterSection label="MODELO">
            {availableModels.map((model) => (
              <Chip
                key={model}
                label={model}
                active={pending.models.includes(model)}
                onPress={() => setPending({ ...pending, models: toggle(pending.models, model) })}
              />
            ))}
          </FilterSection>
        </ScrollView>

        {/* Botões */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setPending(EMPTY_FILTERS)}
          >
            <Text style={styles.clearLabel}>Limpar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => { onApply(pending); onClose(); }}
          >
            <Text style={styles.applyLabel}>
              Aplicar{totalSelected > 0 ? ` ${totalSelected}` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.label}>{label}</Text>
      <View style={sectionStyles.chips}>{children}</View>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[chipStyles.chip, active && chipStyles.chipActive]}
      onPress={onPress}
    >
      <Text style={[chipStyles.label, active && chipStyles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Colors.radius2xl,
    borderTopRightRadius: Colors.radius2xl,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '88%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.borderStrong,
    borderRadius: Colors.radiusPill,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  scroll: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusPill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearLabel: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  applyButton: {
    flex: 2,
    backgroundColor: Colors.accent,
    borderRadius: Colors.radiusPill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyLabel: {
    color: Colors.surface,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
});

const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: Colors.textHint,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    fontFamily: 'Sora_600SemiBold',
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

const chipStyles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  labelActive: {
    color: Colors.surface,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
});