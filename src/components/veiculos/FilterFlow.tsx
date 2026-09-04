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
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { VehicleCategory } from '../../types/vehicle';
import { vehicles, featuredVehicle } from '../../mock/veiculos';

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
        <View style={styles.header}>
          <Text style={styles.title}>Filtro</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          <FilterSection label="Marca">
            {availableBrands.map((brand) => (
              <Chip
                key={brand}
                label={brand.charAt(0) + brand.slice(1).toLowerCase()}
                active={filters.brands.includes(brand)}
                onPress={() => toggleBrand(brand)}
              />
            ))}
          </FilterSection>

          {mostrarCategoria && (
            <RevealSection key="categoria">
              <Divider />
              <FilterSection label="Categoria">
                {availableCategories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    active={filters.categories.includes(cat)}
                    onPress={() => toggleCategory(cat)}
                  />
                ))}
              </FilterSection>
            </RevealSection>
          )}

          {mostrarAnoEModelo && (
            <RevealSection key="ano-modelo">
              <Divider />
              <FilterSection label="Ano">
                {availableYears.map((year) => (
                  <Chip
                    key={year}
                    label={String(year)}
                    active={filters.years.includes(year)}
                    onPress={() => onChange({ ...filters, years: toggle(filters.years, year) })}
                  />
                ))}
              </FilterSection>

              <Divider />
              <FilterSection label="Modelo">
                {availableModels.map((model) => (
                  <Chip
                    key={model}
                    label={model}
                    active={filters.models.includes(model)}
                    onPress={() => onChange({ ...filters, models: toggle(filters.models, model) })}
                  />
                ))}
              </FilterSection>
            </RevealSection>
          )}

          <View style={{ height: 12 }} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          {temFiltrosAtivos && (
            <TouchableOpacity style={styles.clearButton} onPress={() => onChange(EMPTY_FILTERS)}>
              <Text style={styles.clearLabel}>Limpar</Text>
            </TouchableOpacity>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  closeButton: {
    padding: 4,
  },
  scroll: {
    paddingHorizontal: 20,
  },
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
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  viewButton: {
    flex: 2,
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

const sectionStyles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontFamily: 'Sora_500Medium',
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});

const chipStyles = StyleSheet.create({
  chip: {
    backgroundColor: Colors.surface2,
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: Colors.action,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  labelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
});
