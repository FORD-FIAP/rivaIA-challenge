/** Bottom sheet de filtros da tela de Veículos — sobe de baixo, cobrindo a tela */
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { VehicleCategory } from '../../types/vehicle';
import { vehicles, featuredVehicle } from '../../mock/veiculos';
import { FilterSheetHeader, FilterClearLabel, FilterChipRow, FilterChip } from '../shared/FilterChips';

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

interface FilterSheetProps {
  visible: boolean;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose: () => void;
}

/** Um veículo bater com os filtros, ignorando uma dimensão (pra calcular
 * quais opções ainda fazem sentido mostrar naquela seção). */
function matches(v: (typeof ALL_VEHICLES)[number], filters: FilterState, excluding: keyof FilterState): boolean {
  if (excluding !== 'years' && filters.years.length > 0 && !filters.years.includes(v.ano)) return false;
  if (excluding !== 'brands' && filters.brands.length > 0 && !filters.brands.includes(v.marca)) return false;
  if (excluding !== 'models' && filters.models.length > 0 && !filters.models.includes(v.modelo)) return false;
  if (excluding !== 'categories' && filters.categories.length > 0 && !filters.categories.includes(v.categoria)) return false;
  return true;
}

export function FilterSheet({ visible, filters, onChange, onClose }: FilterSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

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

  const availableBrands = [...new Set(ALL_VEHICLES.filter((v) => matches(v, filters, 'brands')).map((v) => v.marca))]
    .sort((a, b) => a.localeCompare(b));
  const availableCategories = ([...new Set(ALL_VEHICLES.filter((v) => matches(v, filters, 'categories')).map((v) => v.categoria))] as VehicleCategory[])
    .sort((a, b) => a.localeCompare(b));
  const availableYears = [...new Set(ALL_VEHICLES.filter((v) => matches(v, filters, 'years')).map((v) => v.ano))]
    .sort((a, b) => a - b);
  const availableModels = [...new Set(ALL_VEHICLES.filter((v) => matches(v, filters, 'models')).map((v) => v.modelo))]
    .sort((a, b) => a.localeCompare(b));

  const mostrarCategoria = filters.brands.length > 0;
  const mostrarAnoEModelo = filters.categories.length > 0;
  const temFiltrosAtivos =
    filters.brands.length > 0 || filters.categories.length > 0 || filters.years.length > 0 || filters.models.length > 0;

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((i) => i !== value) : [...list, value];
  }

  function toggleBrand(brand: string) {
    // Ao mudar a marca, os passos seguintes recomeçam do zero.
    onChange({ brands: toggle(filters.brands, brand), categories: [], years: [], models: [] });
  }

  function toggleCategory(cat: VehicleCategory) {
    onChange({ ...filters, categories: toggle(filters.categories, cat), years: [], models: [] });
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
            {availableBrands.map((brand) => (
              <FilterChip
                key={brand}
                label={brand.charAt(0) + brand.slice(1).toLowerCase()}
                active={filters.brands.includes(brand)}
                onPress={() => toggleBrand(brand)}
              />
            ))}
          </FilterChipRow>

          {mostrarCategoria && (
            <RevealSection key="categoria">
              <Divider />
              <FilterChipRow label="Categoria">
                {availableCategories.map((cat) => (
                  <FilterChip
                    key={cat}
                    label={cat}
                    active={filters.categories.includes(cat)}
                    onPress={() => toggleCategory(cat)}
                  />
                ))}
              </FilterChipRow>
            </RevealSection>
          )}

          {mostrarAnoEModelo && (
            <RevealSection key="ano-modelo">
              <Divider />
              <FilterChipRow label="Ano">
                {availableYears.map((year) => (
                  <FilterChip
                    key={year}
                    label={String(year)}
                    active={filters.years.includes(year)}
                    onPress={() => onChange({ ...filters, years: toggle(filters.years, year) })}
                  />
                ))}
              </FilterChipRow>

              <Divider />
              <FilterChipRow label="Modelo">
                {availableModels.map((model) => (
                  <FilterChip
                    key={model}
                    label={model}
                    active={filters.models.includes(model)}
                    onPress={() => onChange({ ...filters, models: toggle(filters.models, model) })}
                  />
                ))}
              </FilterChipRow>
            </RevealSection>
          )}

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

/** Aparece com um fade + leve deslize de baixo pra cima, ao montar. */
function RevealSection({ children }: { children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 18,
  },
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
