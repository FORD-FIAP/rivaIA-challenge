/** Tela de busca e listagem de veículos — marca e modelo reais da FIPE */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { VeiculoResultCard } from '../components/veiculos/VeiculoResultCard';
import { FilterSheet, FilterState, EMPTY_FILTERS } from '../components/veiculos/FilterFlow';
import { VeiculoFicha } from '../components/veiculos/VeiculoFicha';
import { Colors } from '../theme/colors';
import { getFipeBrands, getFipeModels, buildVehicleFromFipe, cacheVehicles, getCachedVehicle } from '../services/fipeApi';
import { Vehicle } from '../types/vehicle';
import { useNavigation } from '../context/NavigationContext';

export function VeiculosScreen() {
  const { openSidebar, pendingVehicleId, clearPendingVehicle } = useNavigation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [search, setSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (pendingVehicleId) {
      const vehicle = getCachedVehicle(pendingVehicleId) ?? null;
      setSelectedVehicle(vehicle);
      clearPendingVehicle();
    }
  }, [pendingVehicleId]);

  const hasSearch = search.trim().length > 0;
  const hasFilters = appliedFilters.brands.length > 0;
  const showResults = hasSearch || hasFilters;

  // Busca os modelos reais da marca selecionada no filtro (ou faz busca livre por texto).
  useEffect(() => {
    if (!showResults) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const brands = await getFipeBrands();
      if (!brands) {
        if (!cancelled) {
          setResults([]);
          setLoading(false);
        }
        return;
      }

      const q = search.trim().toLowerCase();
      const matchingBrands = hasFilters
        ? brands.filter((b) => appliedFilters.brands.includes(b.nome))
        : brands.filter((b) => b.nome.toLowerCase().includes(q));

      // Sem marca aplicada e busca muito genérica: evita disparar dezenas de
      // requisições de uma vez (cada marca = 1 chamada de modelos).
      const brandsToQuery = matchingBrands.slice(0, 6);

      const vehicleLists = await Promise.all(
        brandsToQuery.map(async (brand) => {
          const models = await getFipeModels(brand.valor);
          if (!models) return [];
          const filteredModels = hasFilters
            ? models
            : models.filter((m) => m.modelo.toLowerCase().includes(q));
          return filteredModels.slice(0, 30).map((m) => buildVehicleFromFipe(brand, m));
        }),
      );

      if (cancelled) return;
      const flat = vehicleLists.flat();
      cacheVehicles(flat);
      setResults(flat);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [search, appliedFilters]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header desta tela */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Veículos</Text>
          <Text style={styles.headerSubtitle}>Marca e modelo reais da FIPE</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
          <Feather name="menu" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Barra de busca + botão filtro */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por marca ou modelo..."
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
        <TouchableOpacity
          style={[styles.filterButton, filterOpen && styles.filterButtonActive]}
          onPress={() => setFilterOpen((v) => !v)}
        >
          <Feather name="sliders" size={16} color={filterOpen ? '#FFFFFF' : Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={!showResults ? styles.scrollEmptyContent : undefined}
        showsVerticalScrollIndicator={false}
      >
        {showResults ? (
          <View style={styles.resultsList}>
            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color={Colors.accent} />
                <Text style={styles.loadingText}>Buscando na tabela FIPE...</Text>
              </View>
            ) : results.length === 0 ? (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyTitle}>Nenhum veículo encontrado</Text>
                <Text style={styles.emptySubtitle}>Tente ajustar os filtros ou a busca</Text>
              </View>
            ) : (
              results.map((vehicle) => (
                <VeiculoResultCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onPress={() => setSelectedVehicle(vehicle)}
                />
              ))
            )}
          </View>
        ) : (
          /* Empty state */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="car-search-outline" size={30} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyStateTitle}>Comece sua busca</Text>
            <Text style={styles.emptyStateText}>
              Use a lupa para pesquisar por nome ou{'\n'}abra o filtro para escolher a marca.
            </Text>
          </View>
        )}
      </ScrollView>

      <FilterSheet
        visible={filterOpen}
        filters={appliedFilters}
        onChange={setAppliedFilters}
        onClose={() => setFilterOpen(false)}
      />

      <VeiculoFicha
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
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
    paddingTop: 28,
    paddingBottom: 16,
    minHeight: 82,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 30,
    letterSpacing: -1,
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
    marginTop: 4,
    marginBottom: 20,
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
  filterButtonActive: {
    backgroundColor: Colors.action,
    borderColor: Colors.action,
  },
  scroll: {
    flex: 1,
  },
  scrollEmptyContent: {
    flexGrow: 1,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 20,
    paddingBottom: 40,
  },
  loadingState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
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
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
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
