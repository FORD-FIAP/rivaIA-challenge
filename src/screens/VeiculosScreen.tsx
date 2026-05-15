/** Tela de busca e listagem de veículos */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Sidebar } from '../components/home/Sidebar';
import { RivaOrb } from '../components/home/RivaOrb';
import { VehicleResultCard } from '../components/veiculos/VehicleResultCard';
import { FilterModal, FilterState, EMPTY_FILTERS } from '../components/veiculos/FilterModal';
import { VehicleDetailSheet } from '../components/veiculos/VehicleDetailSheet';
import { Colors } from '../theme/colors';
import { vehicles, featuredVehicle } from '../mock/vehicles';
import { Vehicle } from '../types/vehicle';
import { useNavigation } from '../context/NavigationContext';

const ALL_VEHICLES: Vehicle[] = [featuredVehicle, ...vehicles];

function applyFilters(search: string, filters: FilterState): Vehicle[] {
  return ALL_VEHICLES.filter((v) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!v.name.toLowerCase().includes(q) && !v.brand.toLowerCase().includes(q)) return false;
    }
    if (filters.brands.length && !filters.brands.includes(v.brand)) return false;
    if (filters.models.length && !filters.models.includes(v.model)) return false;
    if (filters.categories.length && !filters.categories.includes(v.category)) return false;
    if (filters.years.length && !filters.years.includes(v.year)) return false;
    return true;
  });
}

export function VeiculosScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [search, setSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(EMPTY_FILTERS);
  const { pendingVehicleId, clearPendingVehicle } = useNavigation();

  useEffect(() => {
    if (pendingVehicleId) {
      const vehicle = ALL_VEHICLES.find((v) => v.id === pendingVehicleId) ?? null;
      setSelectedVehicle(vehicle);
      clearPendingVehicle();
    }
  }, [pendingVehicleId]);

  const hasSearch = search.trim().length > 0;
  const hasFilters = Object.values(appliedFilters).some((arr) => arr.length > 0);
  const showResults = hasSearch || hasFilters;
  const results = showResults ? applyFilters(search, appliedFilters) : [];

  const activeChips = appliedFilters.brands.map((b) => ({ key: b, label: b.charAt(0) + b.slice(1).toLowerCase(), type: 'brands' as const }));

  function removeChip(type: keyof FilterState, value: string | number) {
    setAppliedFilters((prev) => ({
      ...prev,
      [type]: (prev[type] as (string | number)[]).filter((v) => v !== value),
    }));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header desta tela */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Veículos</Text>
          <Text style={styles.headerSubtitle}>Pesquise ou filtre</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={() => setSidebarOpen(true)}>
          <Feather name="menu" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Barra de busca + botão filtro */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por marca, modelo..."
            placeholderTextColor={Colors.textHint}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={15} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterOpen(true)}>
          <Feather name="sliders" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {showResults ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Chips de filtros ativos */}
          {activeChips.length > 0 && (
            <View style={styles.activeFiltersRow}>
              {activeChips.map((chip) => (
                <TouchableOpacity
                  key={chip.key}
                  style={styles.activeChip}
                  onPress={() => removeChip(chip.type, chip.key)}
                >
                  <Text style={styles.activeChipLabel}>{chip.label}</Text>
                  <Feather name="x" size={12} color={Colors.surface} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setAppliedFilters(EMPTY_FILTERS)}>
                <Text style={styles.clearAll}>Limpar tudo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Lista de resultados */}
          <View style={styles.resultsList}>
            {results.length === 0 ? (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyTitle}>Nenhum veículo encontrado</Text>
                <Text style={styles.emptySubtitle}>Tente ajustar os filtros ou a busca</Text>
              </View>
            ) : (
              results.map((vehicle) => (
                <VehicleResultCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onPress={() => setSelectedVehicle(vehicle)}
                />
              ))
            )}
          </View>
        </ScrollView>
      ) : (
        /* Empty state */
        <View style={styles.emptyState}>
          <RivaOrb />
          <Text style={styles.emptyStateTitle}>Comece sua busca</Text>
          <Text style={styles.emptyStateText}>
            Use a lupa para pesquisar por nome ou{'\n'}abra o filtro para encontrar o carro ideal.
          </Text>
        </View>
      )}

      <FilterModal
        visible={filterOpen}
        applied={appliedFilters}
        onApply={setAppliedFilters}
        onClose={() => setFilterOpen(false)}
      />

      <VehicleDetailSheet
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
      />

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    marginTop: 2,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: Colors.radiusPill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Sora_400Regular',
  },
  filterButton: {
    width: 42,
    height: 42,
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
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  activeChipLabel: {
    color: Colors.surface,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  clearAll: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  resultsList: {
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 40,
  },
  emptyResults: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  emptySubtitle: {
    color: Colors.textHint,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyStateTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    textAlign: 'center',
  },
  emptyStateText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Sora_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
});