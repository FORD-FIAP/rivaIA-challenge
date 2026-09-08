/**
 * Peças de UI compartilhadas entre o filtro de Veículos (FilterFlow.tsx) e o
 * seletor de veículo de Comparar (CompararScreen.tsx) — garante que os dois
 * bottom sheets tenham exatamente o mesmo layout de header e chips.
 */
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

export function FilterSheetHeader({
  title,
  onClose,
  rightExtra,
}: {
  title: string;
  onClose: () => void;
  rightExtra?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.headerActions}>
        {rightExtra}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function FilterClearLabel({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.clearLabel}>Limpar</Text>
    </TouchableOpacity>
  );
}

export function FilterChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <ScrollView style={styles.chipsScrollArea} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        <View style={styles.chipsWrap}>{children}</View>
      </ScrollView>
    </View>
  );
}

export function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress} activeOpacity={0.75}>
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  closeButton: {
    padding: 4,
  },
  clearLabel: {
    color: Colors.accent,
    fontSize: 12,
    fontFamily: 'Sora_600SemiBold',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 4,
    gap: 6,
  },
  sectionLabel: {
    color: Colors.textHint,
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipsScrollArea: {
    maxHeight: 180,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingRight: 20,
    paddingBottom: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipLabel: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontFamily: 'Sora_400Regular',
  },
  chipLabelActive: {
    color: Colors.surface,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
});
