/** Tela de comparação de veículos — até 4 modelos lado a lado */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { useNavigation } from '../context/NavigationContext';
import { useFavoritesContext } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { vehicles, featuredVehicle } from '../mock/veiculos';
import { Vehicle } from '../types/vehicle';
import { FilterSheetHeader, FilterClearLabel, FilterChipRow, FilterChip } from '../components/shared/FilterChips';

const ALL_VEHICLES: Vehicle[] = [featuredVehicle, ...vehicles];

const MAX_SLOTS = 4;
const SLOT_COLORS = [Colors.accent, '#7B6FE8', '#FF9F45', '#F472B6'];
const BETTER_COLOR = '#3DDC84';
const WORSE_COLOR = '#FF6B6B';

type CellState = 'best' | 'worst' | 'neutral';

interface AttrSpec {
  label: string;
  unit?: string;
  get: (v: Vehicle) => string | number | undefined;
  /** Quando true, o valor é numérico (ou tem número extraível) e pode ser comparado. */
  numeric?: boolean;
  /** Quando definido, valores que batem com o regex viram "1" (positivo) e o resto "0". */
  positiveRegex?: RegExp;
  higherIsBetter?: boolean;
}

function parseLeadingNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return isNaN(value) ? undefined : value;
  if (typeof value !== 'string') return undefined;
  const match = value.replace(',', '.').match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

/** Calcula, pra uma lista de veículos, o valor formatado + estado (melhor/pior/neutro) de cada um numa linha. */
function resolveRow(vehiclesInView: Vehicle[], spec: AttrSpec): { text: string; state: CellState }[] {
  const raw = vehiclesInView.map((v) => spec.get(v));

  if (!spec.numeric && !spec.positiveRegex) {
    return raw.map((r) => ({ text: r !== undefined && r !== null && r !== '' ? String(r) : '—', state: 'neutral' }));
  }

  const higherIsBetter = spec.higherIsBetter !== false;
  const scores = raw.map((r) => {
    if (spec.positiveRegex) {
      if (r === undefined) return undefined;
      return spec.positiveRegex.test(String(r)) ? 1 : 0;
    }
    return parseLeadingNumber(r);
  });

  const defined = scores.filter((s): s is number => s !== undefined);
  const distinct = new Set(defined);
  const canHighlight = distinct.size > 1;
  const best = canHighlight ? (higherIsBetter ? Math.max(...defined) : Math.min(...defined)) : undefined;
  const worst = canHighlight ? (higherIsBetter ? Math.min(...defined) : Math.max(...defined)) : undefined;

  return raw.map((r, i) => {
    const score = scores[i];
    let state: CellState = 'neutral';
    if (canHighlight && score !== undefined) {
      if (score === best && score !== worst) state = 'best';
      else if (score === worst && score !== best) state = 'worst';
    }
    const text =
      r === undefined || r === null || r === ''
        ? '—'
        : spec.positiveRegex
        ? String(r)
        : `${r}${spec.unit ? ` ${spec.unit}` : ''}`;
    return { text, state };
  });
}

// ─── Tela principal ──────────────────────────────────────────────────────────

export function CompararScreen() {
  const {
    openSidebar,
    pendingComparisonIds,
    clearPendingComparison,
    pendingCompareVehicleId,
    clearPendingCompareVehicle,
  } = useNavigation();
  const { isComparisonFavorite, toggleComparison } = useFavoritesContext();
  const { isAuthenticated, requestLogin } = useAuth();
  const [slots, setSlots] = useState<(Vehicle | null)[]>([null, null]);
  const [pickingSlot, setPickingSlot] = useState<number | null>(null);
  const [motorOpen, setMotorOpen] = useState(true);
  const [carroceriaOpen, setCarroceriaOpen] = useState(true);
  const [offRoadOpen, setOffRoadOpen] = useState(true);
  const [segurancaOpen, setSegurancaOpen] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const filledVehicles = slots.filter((v): v is Vehicle => v !== null);
  const comparisonReady = filledVehicles.length >= 2;

  useEffect(() => {
    if (comparisonReady) {
      setTimeout(() => scrollRef.current?.scrollTo({ y: 280, animated: true }), 100);
    }
  }, [comparisonReady]);

  useEffect(() => {
    if (pendingComparisonIds) {
      const [idA, idB] = pendingComparisonIds;
      const a = ALL_VEHICLES.find((v) => v.id === idA) ?? null;
      const b = ALL_VEHICLES.find((v) => v.id === idB) ?? null;
      if (a && b) setSlots([a, b]);
      clearPendingComparison();
    }
  }, [pendingComparisonIds]);

  useEffect(() => {
    if (pendingCompareVehicleId) {
      const vehicle = ALL_VEHICLES.find((v) => v.id === pendingCompareVehicleId) ?? null;
      if (vehicle) {
        setSlots([vehicle, null]);
        setPickingSlot(1);
      }
      clearPendingCompareVehicle();
    }
  }, [pendingCompareVehicleId]);

  function openPicker(index: number) {
    setPickingSlot(index);
  }

  function selectVehicle(vehicle: Vehicle) {
    if (pickingSlot === null) return;
    const slotIndex = pickingSlot;
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = vehicle;
      return next;
    });
    setPickingSlot(null);
  }

  function removeVehicle(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      // Slots extras (3º/4º) vazios somem; os 2 primeiros só ficam vazios.
      if (index >= 2 && next[index] !== null) {
        next[index] = null;
        return next;
      }
      next[index] = null;
      return next;
    });
  }

  function addSlot() {
    setSlots((prev) => (prev.length < MAX_SLOTS ? [...prev, null] : prev));
  }

  function removeEmptySlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  // O "salvar comparação" (estrela) só existe pra pares — a API de favoritos é 1x1.
  const canSaveComparison = filledVehicles.length === 2;
  const comparisonSaved =
    canSaveComparison && isAuthenticated && isComparisonFavorite(filledVehicles[0].id, filledVehicles[1].id);

  function toggleSavedComparison() {
    if (!canSaveComparison) return;
    toggleComparison(filledVehicles[0].id, filledVehicles[1].id);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Comparar</Text>
          <Text style={styles.headerSubtitle}>Escolha até {MAX_SLOTS} modelos</Text>
        </View>
        <View style={styles.headerActions}>
          {canSaveComparison && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                if (isAuthenticated) {
                  toggleSavedComparison();
                } else {
                  requestLogin(
                    { type: 'comparison', vehicleA: filledVehicles[0], vehicleB: filledVehicles[1] },
                    () => toggleComparison(filledVehicles[0].id, filledVehicles[1].id),
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
        {/* Slots — rolagem horizontal pra caber até 4 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.slots}
        >
          {slots.map((vehicle, i) =>
            vehicle ? (
              <FilledSlot
                key={i}
                vehicle={vehicle}
                color={SLOT_COLORS[i % SLOT_COLORS.length]}
                onSwap={() => openPicker(i)}
                onRemove={() => removeVehicle(i)}
              />
            ) : (
              <EmptySlot
                key={i}
                onPress={() => openPicker(i)}
                onRemove={i >= 2 ? () => removeEmptySlot(i) : undefined}
              />
            ),
          )}
          {slots.length < MAX_SLOTS && (
            <TouchableOpacity style={styles.addSlot} activeOpacity={0.7} onPress={addSlot}>
              <Feather name="plus-circle" size={22} color={Colors.textMuted} />
              <Text style={styles.addSlotLabel}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* ── Seções de comparação (a partir de 2 selecionados) ── */}
        {comparisonReady && (
          <>
            <RadarSection vehicles={filledVehicles} colors={SLOT_COLORS} />

            <ComparisonSection
              icon={<MaterialCommunityIcons name="engine-outline" size={16} color={Colors.accent} />}
              title="Motor & Desempenho"
              vehicles={filledVehicles}
              colors={SLOT_COLORS}
              open={motorOpen}
              onToggle={() => setMotorOpen((o) => !o)}
              attrs={[
                { label: 'Potência', get: (v) => v.motorizacao_desempenho?.potencia, numeric: true, unit: 'cv' },
                { label: 'Torque', get: (v) => v.motorizacao_desempenho?.torque, numeric: true, unit: 'Nm' },
                { label: 'Combustível', get: (v) => v.motorizacao_desempenho?.combustivel },
                { label: '0-100 km/h', get: (v) => v.motorizacao_desempenho?.aceleracao, numeric: true, higherIsBetter: false },
              ]}
            />

            <ComparisonSection
              icon={<Feather name="edit-2" size={15} color={Colors.accent} />}
              title="Carroceria & Dimensões"
              vehicles={filledVehicles}
              colors={SLOT_COLORS}
              open={carroceriaOpen}
              onToggle={() => setCarroceriaOpen((o) => !o)}
              attrs={[
                { label: 'Comprimento', get: (v) => v.dimensoes?.comprimento, numeric: true, unit: 'mm' },
                { label: 'Largura', get: (v) => v.dimensoes?.largura, numeric: true, unit: 'mm' },
                { label: 'Altura', get: (v) => v.dimensoes?.altura, numeric: true, unit: 'mm' },
                { label: 'Cap. Carga', get: (v) => v.capacidade?.capacidade_reboque, numeric: true },
              ]}
            />

            <ComparisonSection
              icon={<MaterialCommunityIcons name="terrain" size={16} color={Colors.accent} />}
              title="Off-Road & Tração"
              vehicles={filledVehicles}
              colors={SLOT_COLORS}
              open={offRoadOpen}
              onToggle={() => setOffRoadOpen((o) => !o)}
              attrs={[
                { label: 'Ângulo de ataque', get: (v) => v.off_road?.angulo_ataque, numeric: true, unit: '°' },
                { label: 'Ângulo de saída', get: (v) => v.off_road?.angulo_saida, numeric: true, unit: '°' },
                { label: 'Prof. na água', get: (v) => v.off_road?.profundidade_agua, numeric: true, unit: 'mm' },
                { label: 'Diferencial bloqueável', get: (v) => v.off_road?.diferencial_traseiro_bloqueavel, positiveRegex: /sim/i },
                { label: 'Controle de descida', get: (v) => v.off_road?.controle_descida, positiveRegex: /sim/i },
              ]}
            />

            <ComparisonSection
              icon={<MaterialCommunityIcons name="shield-check-outline" size={16} color={Colors.accent} />}
              title="Segurança"
              vehicles={filledVehicles}
              colors={SLOT_COLORS}
              open={segurancaOpen}
              onToggle={() => setSegurancaOpen((o) => !o)}
              attrs={[
                { label: 'Airbags', get: (v) => v.tecnologia_seguranca?.airbags, numeric: true },
                { label: 'Frenagem autônoma', get: (v) => v.tecnologia_seguranca?.frenagem_automatica, positiveRegex: /sim|autônoma|aeb/i },
                { label: 'Alerta ponto cego', get: (v) => v.tecnologia_seguranca?.alerta_ponto_cego, positiveRegex: /sim/i },
                { label: 'Câmera 360°', get: (v) => v.tecnologia_seguranca?.camera_360, positiveRegex: /sim/i },
              ]}
            />
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <VehiclePickerModal
        visible={pickingSlot !== null}
        excluded={filledVehicles}
        onSelect={selectVehicle}
        onClose={() => setPickingSlot(null)}
      />
    </SafeAreaView>
  );
}

// ─── Slot vazio ──────────────────────────────────────────────────────────────

function EmptySlot({ onPress, onRemove }: { onPress: () => void; onRemove?: () => void }) {
  return (
    <TouchableOpacity style={styles.slotEmpty} activeOpacity={0.7} onPress={onPress}>
      {onRemove && (
        <TouchableOpacity style={styles.removeEmptySlot} onPress={onRemove} hitSlop={8}>
          <Feather name="x" size={14} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
      <View style={styles.plusCircle}>
        <Feather name="plus" size={22} color={Colors.accent} />
      </View>
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
  const foto = vehicle.imagens?.[0];

  return (
    <View style={styles.slotFilled}>
      <View style={styles.imageArea}>
        {foto ? (
          <Image source={foto} style={styles.slotImage} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name="car-side" size={56} color={color} />
        )}
        <Text style={[styles.brandBadgeOverlay, { color }]}>{vehicle.marca.toUpperCase()}</Text>
      </View>

      <View style={styles.filledInfo}>
        <Text style={[styles.filledBrand, { color }]}>{vehicle.marca.toUpperCase()}</Text>
        <Text style={styles.filledName} numberOfLines={2}>{vehicle.modelo}</Text>
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

// ─── Seção de comparação (linhas valor-label-valor, sem rolagem lateral) ─────

function ComparisonSection({
  icon,
  title,
  vehicles: vehiclesInView,
  colors,
  open,
  onToggle,
  attrs,
}: {
  icon: React.ReactNode;
  title: string;
  vehicles: Vehicle[];
  colors: string[];
  open: boolean;
  onToggle: () => void;
  attrs: AttrSpec[];
}) {
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.7}>
        {icon}
        <Text style={[styles.sectionTitle, { flex: 1 }]}>{title}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
      </TouchableOpacity>

      {open && (
        <View>
          <View style={[styles.attrRow, styles.attrRowHead]}>
            {vehiclesInView.map((v, i) => (
              <View key={v.id} style={styles.attrValueCell}>
                <Text style={[styles.tableHeadText, { color: colors[i % colors.length] }]} numberOfLines={1}>
                  {v.marca}
                </Text>
              </View>
            ))}
            <View style={styles.attrLabelCell}>
              <Text style={styles.tableHeadText}>ATRIBUTO</Text>
            </View>
          </View>

          {attrs.map((spec) => {
            const cells = resolveRow(vehiclesInView, spec);
            return (
              <View key={spec.label} style={styles.attrRow}>
                {cells.map((c, i) => (
                  <View
                    key={i}
                    style={[
                      styles.attrValueCell,
                      c.state === 'best' && styles.cellBest,
                      c.state === 'worst' && styles.cellWorst,
                    ]}
                  >
                    <Text
                      style={[
                        styles.attrValueText,
                        c.state === 'best' && styles.textBest,
                        c.state === 'worst' && styles.textWorst,
                      ]}
                      numberOfLines={2}
                    >
                      {c.text}
                    </Text>
                  </View>
                ))}
                <View style={styles.attrLabelCell}>
                  <Text style={styles.attrLabelText} numberOfLines={2}>{spec.label}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── Radar de atributos (gráfico visual das diferenças) ─────────────────────

const RADAR_AXES: { label: string; get: (v: Vehicle) => number | undefined }[] = [
  { label: 'Potência', get: (v) => parseLeadingNumber(v.motorizacao_desempenho?.potencia) },
  { label: 'Torque', get: (v) => parseLeadingNumber(v.motorizacao_desempenho?.torque) },
  { label: 'Off-road', get: (v) => v.off_road?.angulo_ataque },
  { label: 'Segurança', get: (v) => v.tecnologia_seguranca?.airbags },
  { label: 'Reboque', get: (v) => parseLeadingNumber(v.capacidade?.capacidade_reboque) },
];

function RadarSection({ vehicles: vehiclesInView, colors }: { vehicles: Vehicle[]; colors: string[] }) {
  const size = 260;
  const center = size / 2;
  const radius = size / 2 - 42;
  const axisCount = RADAR_AXES.length;

  const anglePoint = (index: number, r: number) => {
    const angle = (Math.PI * 2 * index) / axisCount - Math.PI / 2;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const maxPerAxis = RADAR_AXES.map((axis) => {
    const values = vehiclesInView.map((v) => axis.get(v) ?? 0);
    return Math.max(...values, 1);
  });

  const polygons = vehiclesInView.map((v, vi) => {
    const points = RADAR_AXES.map((axis, ai) => {
      const value = axis.get(v) ?? 0;
      const normalized = Math.max(0, Math.min(1, value / maxPerAxis[ai]));
      return anglePoint(ai, normalized * radius);
    });
    return { points: points.map((p) => `${p.x},${p.y}`).join(' '), color: colors[vi % colors.length] };
  });

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <View style={styles.radarSection}>
      <Text style={styles.radarTitle}>RADAR DE ATRIBUTOS</Text>
      <View style={styles.radarSvgWrap}>
        <Svg width={size} height={size}>
          {rings.map((ring) => (
            <Polygon
              key={ring}
              points={RADAR_AXES.map((_, ai) => {
                const p = anglePoint(ai, ring * radius);
                return `${p.x},${p.y}`;
              }).join(' ')}
              fill="none"
              stroke={Colors.border}
              strokeWidth={1}
            />
          ))}
          {RADAR_AXES.map((axis, ai) => {
            const p = anglePoint(ai, radius);
            return <Line key={ai} x1={center} y1={center} x2={p.x} y2={p.y} stroke={Colors.border} strokeWidth={1} />;
          })}
          {polygons.map((poly, i) => (
            <Polygon
              key={i}
              points={poly.points}
              fill={poly.color}
              fillOpacity={0.18}
              stroke={poly.color}
              strokeWidth={2}
            />
          ))}
          {RADAR_AXES.map((axis, ai) => {
            const p = anglePoint(ai, radius + 18);
            return (
              <SvgText
                key={axis.label}
                x={p.x}
                y={p.y}
                fill={Colors.textSecondary}
                fontSize={10}
                fontFamily="Sora_600SemiBold"
                textAnchor="middle"
              >
                {axis.label}
              </SvgText>
            );
          })}
        </Svg>
      </View>
      <View style={styles.radarLegend}>
        {vehiclesInView.map((v, i) => (
          <View key={v.id} style={styles.radarLegendItem}>
            <View style={[styles.radarLegendDot, { backgroundColor: colors[i % colors.length] }]} />
            <Text style={styles.radarLegendLabel} numberOfLines={1}>{v.marca} {v.modelo}</Text>
          </View>
        ))}
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
    if (visible) {
      setSelectedBrands([]);
      setSelectedCategories([]);
      setSelectedModels([]);
    }
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
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
        <FilterSheetHeader
          title="Escolher veículo"
          onClose={onClose}
          rightExtra={
            hasAnyFilter ? (
              <FilterClearLabel
                onPress={() => {
                  setSelectedBrands([]);
                  setSelectedCategories([]);
                  setSelectedModels([]);
                }}
              />
            ) : undefined
          }
        />

        <View style={styles.filtersBlock}>
          <FilterChipRow label="Marca">
            {allBrands.map((brand) => (
              <FilterChip
                key={brand}
                label={brand.charAt(0) + brand.slice(1).toLowerCase()}
                active={selectedBrands.includes(brand)}
                onPress={() => toggleBrand(brand)}
              />
            ))}
          </FilterChipRow>

          {selectedBrands.length > 0 && availableCategories.length > 0 && (
            <FilterChipRow label="Categoria">
              {availableCategories.map((cat) => (
                <FilterChip
                  key={cat}
                  label={cat}
                  active={selectedCategories.includes(cat)}
                  onPress={() => toggleCategory(cat)}
                />
              ))}
            </FilterChipRow>
          )}

          {selectedCategories.length > 0 && availableModels.length > 0 && (
            <FilterChipRow label="Modelo">
              {availableModels.map((model) => (
                <FilterChip
                  key={model}
                  label={model}
                  active={selectedModels.includes(model)}
                  onPress={() => setSelectedModels((prev) => toggle(prev, model))}
                />
              ))}
            </FilterChipRow>
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
                {item.imagens?.[0] ? (
                  <Image source={item.imagens[0]} style={styles.listThumbImage} resizeMode="cover" />
                ) : (
                  <MaterialCommunityIcons name="car-side" size={28} color={Colors.action} />
                )}
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

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

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
    width: 160,
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
    position: 'relative',
  },
  removeEmptySlot: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  plusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    textAlign: 'center',
  },
  addSlot: {
    width: 90,
    borderRadius: Colors.radiusLg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addSlotLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Sora_500Medium',
  },

  // Slot preenchido
  slotFilled: {
    width: 160,
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
    height: 100,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  slotImage: {
    width: '100%',
    height: '100%',
  },
  brandBadgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    letterSpacing: 1.5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Colors.radiusPill,
    overflow: 'hidden',
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
  filledPrice: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    marginTop: 4,
  },

  // Radar
  radarSection: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: 'center',
  },
  radarTitle: {
    alignSelf: 'flex-start',
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  radarSvgWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  radarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radarLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  radarLegendLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
    maxWidth: 140,
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

  // Tabela em grade (linhas fixas, rolagem horizontal quando precisa)
  attrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 8,
  },
  attrRowHead: {
    borderBottomColor: Colors.borderStrong,
    paddingBottom: 6,
  },
  attrLabelCell: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attrLabelText: {
    color: Colors.textHint,
    fontSize: 9,
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  attrValueCell: {
    flex: 1,
    minWidth: 0,
    borderRadius: Colors.radiusMd,
    paddingHorizontal: 4,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attrValueText: {
    color: Colors.textValue,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    textAlign: 'center',
  },
  cellBest: {
    backgroundColor: `${BETTER_COLOR}22`,
  },
  cellWorst: {
    backgroundColor: `${WORSE_COLOR}1a`,
  },
  textBest: {
    color: BETTER_COLOR,
  },
  textWorst: {
    color: WORSE_COLOR,
  },
  tableHeadText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 0.8,
    textAlign: 'center',
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
    backgroundColor: Colors.bg,
    borderTopLeftRadius: Colors.radius2xl,
    borderTopRightRadius: Colors.radius2xl,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  filtersBlock: {
    gap: 10,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listEmpty: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  listEmptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 20, paddingHorizontal: 20, gap: 4 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
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
    overflow: 'hidden',
  },
  listThumbImage: {
    width: '100%',
    height: '100%',
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
