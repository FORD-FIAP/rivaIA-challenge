/** Tela de comparação de veículos */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useNavigation } from '../context/NavigationContext';
import { useFavoritesContext } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { vehicles, featuredVehicle } from '../mock/veiculos';
import { Vehicle } from '../types/vehicle';

const ALL_VEHICLES: Vehicle[] = [featuredVehicle, ...vehicles];

const COLOR_A = Colors.accent;       // ciano
const COLOR_B = '#7B6FE8';           // roxo suave

// ─── Tela principal ──────────────────────────────────────────────────────────

export function CompararScreen() {
  const { openSidebar, pendingComparisonIds, clearPendingComparison } = useNavigation();
  const { isComparisonFavorite, toggleComparison } = useFavoritesContext();
  const { isAuthenticated, requestLogin } = useAuth();
  const [slots, setSlots] = useState<[Vehicle | null, Vehicle | null]>([null, null]);
  const [pickingSlot, setPickingSlot] = useState<0 | 1 | null>(null);
  const [motorOpen, setMotorOpen] = useState(true);
  const [carroceriaOpen, setCarroceriaOpen] = useState(true);
  const [offRoadOpen, setOffRoadOpen] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const bothSelected = slots[0] !== null && slots[1] !== null;

  useEffect(() => {
    if (bothSelected) {
      setTimeout(() => scrollRef.current?.scrollTo({ y: 260, animated: true }), 100);
    }
  }, [bothSelected]);

  useEffect(() => {
    if (pendingComparisonIds) {
      const [idA, idB] = pendingComparisonIds;
      const a = ALL_VEHICLES.find((v) => v.id === idA) ?? null;
      const b = ALL_VEHICLES.find((v) => v.id === idB) ?? null;
      if (a && b) setSlots([a, b]);
      clearPendingComparison();
    }
  }, [pendingComparisonIds]);

  function openPicker(index: 0 | 1) {
    setPickingSlot(index);
  }

  function selectVehicle(vehicle: Vehicle) {
    if (pickingSlot === null) return;
    const slotIndex = pickingSlot;
    setSlots((prev) => {
      const next: [Vehicle | null, Vehicle | null] = [...prev] as [Vehicle | null, Vehicle | null];
      next[slotIndex] = vehicle;
      return next;
    });
    setPickingSlot(null);
  }

  function removeVehicle(index: 0 | 1) {
    setSlots((prev) => {
      const next: [Vehicle | null, Vehicle | null] = [...prev] as [Vehicle | null, Vehicle | null];
      next[index] = null;
      return next;
    });
  }

  const vA = slots[0]!;
  const vB = slots[1]!;
  const comparisonSaved = bothSelected && isAuthenticated && isComparisonFavorite(vA.id, vB.id);

  function toggleSavedComparison() {
    if (!bothSelected) return;
    toggleComparison(vA.id, vB.id);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Comparar</Text>
          <Text style={styles.headerSubtitle}>Escolha até 2 modelos</Text>
        </View>
        <View style={styles.headerActions}>
          {bothSelected && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                if (isAuthenticated) {
                  toggleSavedComparison();
                } else {
                  requestLogin(
                    { type: 'comparison', vehicleA: vA, vehicleB: vB },
                    () => toggleComparison(vA.id, vB.id),
                  );
                }
              }}
            >
              <MaterialCommunityIcons
                name={comparisonSaved ? 'star' : 'star-outline'}
                size={18}
                color={comparisonSaved ? Colors.accent : Colors.textMuted}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
            <Feather name="menu" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Slots */}
        <View style={styles.slots}>
          {([0, 1] as const).map((i) =>
            slots[i] ? (
              <FilledSlot
                key={i}
                vehicle={slots[i]!}
                color={i === 0 ? COLOR_A : COLOR_B}
                onSwap={() => openPicker(i)}
                onRemove={() => removeVehicle(i)}
              />
            ) : (
              <EmptySlot key={i} onPress={() => openPicker(i)} />
            ),
          )}
        </View>

        {/* ── Seções de comparação (só quando ambos selecionados) ── */}
        {bothSelected && (
          <>
            {/* Motor & Desempenho */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setMotorOpen((o) => !o)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="engine-outline" size={16} color={Colors.accent} />
                <Text style={[styles.sectionTitle, { flex: 1 }]}>Motor & Desempenho</Text>
                <Feather
                  name={motorOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>

              {motorOpen && (
                <View style={styles.table}>
                  {/* Cabeçalho */}
                  <View style={[styles.tableRow, styles.tableHead]}>
                    <Text style={[styles.tableCell, styles.tableCellAttr, styles.tableHeadText]}>
                      ATRIBUTO
                    </Text>
                    <Text style={[styles.tableCell, styles.tableHeadText, { color: COLOR_A }]}>
                      {vA.marca}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableHeadText, { color: COLOR_B }]}>
                      {vB.marca}
                    </Text>
                  </View>

                  {/* Versão */}
                  <TableRow
                    label=""
                    valA={vA.versao}
                    valB={vB.versao}
                    colorA={COLOR_A}
                    colorB={COLOR_B}
                    highlight={false}
                  />

                  {/* Linhas numéricas com destaque */}
                  <TableRowNum label="Motor" strA={vA.motorizacao_desempenho?.motor} strB={vB.motorizacao_desempenho?.motor} colorA={COLOR_A} colorB={COLOR_B} />
                  <TableRowNum label="Potência" strA={`${vA.motorizacao_desempenho?.potencia} cv`} strB={`${vB.motorizacao_desempenho?.potencia} cv`} numA={Number(vA.motorizacao_desempenho?.potencia)} numB={Number(vB.motorizacao_desempenho?.potencia)} colorA={COLOR_A} colorB={COLOR_B} higherIsBetter />
                  <TableRowNum label="Torque" strA={`${vA.motorizacao_desempenho?.torque} Nm`} strB={`${vB.motorizacao_desempenho?.torque} Nm`} numA={Number(vA.motorizacao_desempenho?.torque)} numB={Number(vB.motorizacao_desempenho?.torque)} colorA={COLOR_A} colorB={COLOR_B} higherIsBetter />
                  <TableRowNum label="Combustível" strA={vA.motorizacao_desempenho?.combustivel} strB={vB.motorizacao_desempenho?.combustivel} colorA={COLOR_A} colorB={COLOR_B} />
                </View>
              )}
            </View>

            {/* Carroceria & Dimensões */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setCarroceriaOpen((o) => !o)}
                activeOpacity={0.7}
              >
                <Feather name="edit-2" size={15} color={Colors.accent} />
                <Text style={[styles.sectionTitle, { flex: 1 }]}>Carroceria & Dimensões</Text>
                <Feather name={carroceriaOpen ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              {carroceriaOpen && (
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHead]}>
                    <Text style={[styles.tableCell, styles.tableCellAttr, styles.tableHeadText]}>ATRIBUTO</Text>
                    <Text style={[styles.tableCell, styles.tableHeadText, { color: COLOR_A }]}>{vA.marca}</Text>
                    <Text style={[styles.tableCell, styles.tableHeadText, { color: COLOR_B }]}>{vB.marca}</Text>
                  </View>
                  <TableRow label="" valA={vA.versao} valB={vB.versao} colorA={COLOR_A} colorB={COLOR_B} highlight={false} />
                  <TableRowNum label="Carroceria" strA={vA.classificacao} strB={vB.classificacao} colorA={COLOR_A} colorB={COLOR_B} />
                  <TableRowNum
                    label="Comprimento"
                    strA={vA.dimensoes ? `${vA.dimensoes.comprimento} mm` : undefined}
                    strB={vB.dimensoes ? `${vB.dimensoes.comprimento} mm` : undefined}
                    numA={vA.dimensoes?.comprimento}
                    numB={vB.dimensoes?.comprimento}
                    colorA={COLOR_A} colorB={COLOR_B} higherIsBetter
                  />
                  <TableRowNum
                    label="Largura"
                    strA={vA.dimensoes ? `${vA.dimensoes.largura} mm` : undefined}
                    strB={vB.dimensoes ? `${vB.dimensoes.largura} mm` : undefined}
                    numA={vA.dimensoes?.largura}
                    numB={vB.dimensoes?.largura}
                    colorA={COLOR_A} colorB={COLOR_B} higherIsBetter
                  />
                  <TableRowNum
                    label="Altura"
                    strA={vA.dimensoes ? `${vA.dimensoes.altura} mm` : undefined}
                    strB={vB.dimensoes ? `${vB.dimensoes.altura} mm` : undefined}
                    numA={vA.dimensoes?.altura}
                    numB={vB.dimensoes?.altura}
                    colorA={COLOR_A} colorB={COLOR_B} higherIsBetter
                  />
                  <TableRowNum
                    label="Cap. Carga"
                    strA={vA.capacidade?.capacidade_reboque}
                    strB={vB.capacidade?.capacidade_reboque}
                    colorA={COLOR_A} colorB={COLOR_B}
                  />
                </View>
              )}
            </View>

            {/* Off-Road & Tração */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setOffRoadOpen((o) => !o)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="terrain" size={16} color={Colors.accent} />
                <Text style={[styles.sectionTitle, { flex: 1 }]}>Off-Road & Tração</Text>
                <Feather name={offRoadOpen ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              {offRoadOpen && (
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHead]}>
                    <Text style={[styles.tableCell, styles.tableCellAttr, styles.tableHeadText]}>ATRIBUTO</Text>
                    <Text style={[styles.tableCell, styles.tableHeadText, { color: COLOR_A }]}>{vA.marca}</Text>
                    <Text style={[styles.tableCell, styles.tableHeadText, { color: COLOR_B }]}>{vB.marca}</Text>
                  </View>
                  <TableRow label="" valA={vA.versao} valB={vB.versao} colorA={COLOR_A} colorB={COLOR_B} highlight={false} />
                  <TableRowNum label="Amortecedor" strA={vA.off_road?.suspensao} strB={vB.off_road?.suspensao} colorA={COLOR_A} colorB={COLOR_B} />
                  <TableRowNum label="Sistema AWD" strA={vA.off_road?.modos_tracao} strB={vB.off_road?.modos_tracao} colorA={COLOR_A} colorB={COLOR_B} />
                  <TableRowNum label="Dif. Traseiro" strA={vA.off_road?.diferencial_traseiro_bloqueavel} strB={vB.off_road?.diferencial_traseiro_bloqueavel} colorA={COLOR_A} colorB={COLOR_B} />
                  <TableRowNum
                    label="Alt. Mín. Solo"
                    strA={vA.dimensoes?.vao_livre}
                    strB={vB.dimensoes?.vao_livre}
                    colorA={COLOR_A} colorB={COLOR_B}
                  />
                  <TableRowNum label="Controle Descida" strA={vA.off_road?.controle_descida} strB={vB.off_road?.controle_descida} colorA={COLOR_A} colorB={COLOR_B} />
                </View>
              )}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <VehiclePickerModal
        visible={pickingSlot !== null}
        excluded={slots.filter(Boolean) as Vehicle[]}
        onSelect={selectVehicle}
        onClose={() => setPickingSlot(null)}
      />
    </SafeAreaView>
  );
}

// ─── Slot vazio ──────────────────────────────────────────────────────────────

function EmptySlot({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.slotEmpty} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.plusCircle}>
        <Feather name="plus" size={22} color={Colors.accent} />
      </View>
      <Text style={styles.slotTitle}>Comparar Veículo</Text>
      <Text style={styles.slotSubtitle}>Clique para escolher</Text>
    </TouchableOpacity>
  );
}

// ─── Slot preenchido ─────────────────────────────────────────────────────────

function FilledSlot({
  vehicle,
  color,
  onSwap,
  onRemove,
}: {
  vehicle: Vehicle;
  color: string;
  onSwap: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.slotFilled}>
      <View style={styles.imageArea}>
        <Text style={[styles.brandBadge, { color }]}>{vehicle.marca.toUpperCase()}</Text>
        <MaterialCommunityIcons name="car-side" size={56} color={color} />
      </View>

      <View style={styles.filledInfo}>
        <Text style={[styles.filledBrand, { color }]}>{vehicle.marca.toUpperCase()}</Text>
        <Text style={styles.filledName} numberOfLines={2}>{vehicle.versao}</Text>
        <Text style={styles.filledEngine} numberOfLines={1}>
          {vehicle.motorizacao_desempenho?.motor} · {vehicle.ano}
        </Text>
        <Text style={[styles.filledPrice, { color }]}>{vehicle.preco}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={onSwap} activeOpacity={0.8}>
            <MaterialCommunityIcons name="swap-horizontal" size={14} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={onRemove}
            activeOpacity={0.8}
          >
            <Feather name="trash-2" size={14} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Linhas da tabela ─────────────────────────────────────────────────────────

function TableRow({
  label,
  valA,
  valB,
  colorA,
  colorB,
  highlight = false,
}: {
  label: string;
  valA?: string;
  valB?: string;
  colorA: string;
  colorB: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.tableRow}>
      {label ? <Text style={[styles.tableCell, styles.tableCellAttr]}>{label}</Text> : <View style={[styles.tableCell, styles.tableCellAttr]} />}
      <Text style={[styles.tableCell, { color: highlight ? colorA : Colors.textValue }]}>{valA ?? '—'}</Text>
      <Text style={[styles.tableCell, { color: highlight ? colorB : Colors.textValue }]}>{valB ?? '—'}</Text>
    </View>
  );
}

function TableRowNum({
  label,
  strA,
  strB,
  numA,
  numB,
  colorA,
  colorB,
  higherIsBetter,
}: {
  label: string;
  strA?: string;
  strB?: string;
  numA?: number;
  numB?: number;
  colorA: string;
  colorB: string;
  higherIsBetter?: boolean;
}) {
  const canCompare = numA !== undefined && numB !== undefined && !isNaN(numA) && !isNaN(numB);
  const aWins = canCompare && (higherIsBetter ? numA > numB : numA < numB);
  const bWins = canCompare && (higherIsBetter ? numB > numA : numB < numA);

  return (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.tableCellAttr]}>{label}</Text>
      <View style={styles.tableCell}>
        {aWins && (
          <View style={[styles.betterBadge, { backgroundColor: `${colorA}22` }]}>
            <MaterialCommunityIcons name="trophy-outline" size={9} color={colorA} />
            <Text style={[styles.betterLabel, { color: colorA }]}>MELHOR</Text>
          </View>
        )}
        <Text style={{ color: Colors.textValue, fontSize: 12, fontFamily: 'Sora_400Regular' }}>
          {strA ?? '—'}
        </Text>
      </View>
      <View style={styles.tableCell}>
        {bWins && (
          <View style={[styles.betterBadge, { backgroundColor: `${colorB}22` }]}>
            <MaterialCommunityIcons name="trophy-outline" size={9} color={colorB} />
            <Text style={[styles.betterLabel, { color: colorB }]}>MELHOR</Text>
          </View>
        )}
        <Text style={{ color: Colors.textValue, fontSize: 12, fontFamily: 'Sora_400Regular' }}>
          {strB ?? '—'}
        </Text>
      </View>
    </View>
  );
}

// ─── Modal de seleção ─────────────────────────────────────────────────────────

function VehiclePickerModal({
  visible,
  excluded,
  onSelect,
  onClose,
}: {
  visible: boolean;
  excluded: Vehicle[];
  onSelect: (v: Vehicle) => void;
  onClose: () => void;
}) {
  const { height: screenHeight } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    slideAnim.setValue(screenHeight);
    backdropAnim.setValue(0);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedModels([]);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, screenHeight]);

  if (!visible) return null;

  const excludedIds = new Set(excluded.map((v) => v.id));

  // Chips: usam o catálogo COMPLETO (Ranger e similares devem aparecer mesmo quando
  // a única versão disponível já está selecionada na comparação).
  const allBrands = [...new Set(ALL_VEHICLES.map((v) => v.marca))];

  const filteredByBrand = selectedBrands.length > 0
    ? ALL_VEHICLES.filter((v) => selectedBrands.includes(v.marca))
    : ALL_VEHICLES;
  const availableCategories = [...new Set(filteredByBrand.map((v) => v.categoria))];

  const filteredByBrandAndCategory = selectedCategories.length > 0
    ? filteredByBrand.filter((v) => selectedCategories.includes(v.categoria))
    : filteredByBrand;
  const availableModels = [...new Set(filteredByBrandAndCategory.map((v) => v.modelo))];

  const hasAnyFilter =
    selectedBrands.length + selectedCategories.length + selectedModels.length > 0;

  // Lista de carros só aparece quando algum filtro foi aplicado; sempre exclui o já comparado.
  const available = hasAnyFilter
    ? (selectedModels.length > 0
        ? filteredByBrandAndCategory.filter((v) => selectedModels.includes(v.modelo))
        : filteredByBrandAndCategory
      ).filter((v) => !excludedIds.has(v.id))
    : [];

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((i) => i !== value) : [...list, value];
  }

  function toggleBrand(brand: string) {
    const next = toggle(selectedBrands, brand);
    const nextScope = next.length > 0 ? ALL_VEHICLES.filter((v) => next.includes(v.marca)) : ALL_VEHICLES;
    setSelectedBrands(next);
    setSelectedCategories((prev) => prev.filter((c) => nextScope.some((v) => v.categoria === c)));
    setSelectedModels((prev) => prev.filter((m) => nextScope.some((v) => v.modelo === m)));
  }

  function toggleCategory(cat: string) {
    const next = toggle(selectedCategories, cat);
    const nextScope = next.length > 0 ? filteredByBrand.filter((v) => next.includes(v.categoria)) : filteredByBrand;
    setSelectedCategories(next);
    setSelectedModels((prev) => prev.filter((m) => nextScope.some((v) => v.modelo === m)));
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />
        <View style={styles.modalTitleRow}>
          <Text style={styles.modalTitle}>Escolher veículo</Text>
          {hasAnyFilter && (
            <TouchableOpacity
              onPress={() => {
                setSelectedBrands([]);
                setSelectedCategories([]);
                setSelectedModels([]);
              }}
            >
              <Text style={styles.clearFiltersLabel}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersBlock}>
          <PickerFilterRow label="MARCA">
            {allBrands.map((brand) => (
              <PickerChip
                key={brand}
                label={brand.charAt(0) + brand.slice(1).toLowerCase()}
                active={selectedBrands.includes(brand)}
                onPress={() => toggleBrand(brand)}
              />
            ))}
          </PickerFilterRow>

          {selectedBrands.length > 0 && availableCategories.length > 0 && (
            <PickerFilterRow label="CATEGORIA">
              {availableCategories.map((cat) => (
                <PickerChip
                  key={cat}
                  label={cat}
                  active={selectedCategories.includes(cat)}
                  onPress={() => toggleCategory(cat)}
                />
              ))}
            </PickerFilterRow>
          )}

          {selectedCategories.length > 0 && availableModels.length > 0 && (
            <PickerFilterRow label="MODELO">
              {availableModels.map((model) => (
                <PickerChip
                  key={model}
                  label={model}
                  active={selectedModels.includes(model)}
                  onPress={() => setSelectedModels((prev) => toggle(prev, model))}
                />
              ))}
            </PickerFilterRow>
          )}
        </View>

        <FlatList
          data={available}
          keyExtractor={(v) => v.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          ListEmptyComponent={
            <View style={styles.listEmpty}>
              <Text style={styles.listEmptyText}>
                {hasAnyFilter
                  ? 'Nenhum veículo com esses filtros'
                  : 'Selecione marca, categoria ou modelo para ver os carros'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listRow}
              onPress={() => onSelect(item)}
              activeOpacity={0.75}
            >
              <View style={styles.listThumb}>
                <Text style={styles.listThumbLabel}>{item.marca.slice(0, 5).toUpperCase()}</Text>
                <MaterialCommunityIcons name="car-side" size={28} color={Colors.action} />
              </View>
              <View style={styles.listText}>
                <Text style={styles.listBrand}>{item.marca.toUpperCase()}</Text>
                <Text style={styles.listName}>{item.versao}</Text>
                <Text style={styles.listPrice}>{item.preco}</Text>
              </View>
              <Feather name="plus" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </View>
  );
}

function PickerFilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterRowLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsScroll}
      >
        {children}
      </ScrollView>
    </View>
  );
}

function PickerChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.filterChipLabel, active && styles.filterChipLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

  scroll: { paddingBottom: 20 },

  slots: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 24,
  },

  // Slot vazio
  slotEmpty: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  plusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    textAlign: 'center',
  },
  slotSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    textAlign: 'center',
  },

  // Slot preenchido
  slotFilled: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 8,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: Colors.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56,109,189,0.22)',
  },
  actionBtnDanger: {
    backgroundColor: 'rgba(255,107,107,0.12)',
  },
  imageArea: {
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  brandBadge: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    letterSpacing: 1.5,
  },
  filledInfo: { padding: 10, gap: 3 },
  filledBrand: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 1,
  },
  filledName: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    lineHeight: 18,
  },
  filledEngine: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
  },
  filledPrice: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    marginTop: 4,
  },

  // Seções
  section: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  // Tabela
  table: { gap: 0 },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 10,
    gap: 8,
  },
  tableHead: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderStrong,
    paddingBottom: 8,
    marginBottom: 4,
  },
  tableHeadText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 0.8,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    color: Colors.textSecondary,
  },
  tableCellAttr: {
    color: Colors.textHint,
    fontSize: 10,
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 0.8,
  },
  betterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  betterLabel: {
    fontSize: 8,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    letterSpacing: 0.5,
  },

  // Modal
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Colors.radius2xl,
    borderTopRightRadius: Colors.radius2xl,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '88%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  clearFiltersLabel: {
    color: Colors.accent,
    fontSize: 12,
    fontFamily: 'Sora_600SemiBold',
  },
  filtersBlock: {
    gap: 10,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterRow: {
    gap: 6,
  },
  filterRowLabel: {
    color: Colors.textHint,
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 1,
  },
  filterChipsScroll: {
    gap: 6,
    paddingRight: 20,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterChipLabel: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
  },
  filterChipLabelActive: {
    color: Colors.surface,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  listEmpty: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  listEmptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 20, gap: 4 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listThumb: {
    width: 72,
    height: 52,
    borderRadius: Colors.radiusMd,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  listThumbLabel: {
    color: Colors.accent,
    fontSize: 8,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    letterSpacing: 1,
  },
  listText: { flex: 1, gap: 1 },
  listBrand: {
    color: Colors.accent,
    fontSize: 10,
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 0.5,
  },
  listName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  listPrice: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
  },
});
