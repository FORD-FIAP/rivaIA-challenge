/** Gráfico radar (spider) para comparação de scores entre dois veículos */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../theme/colors';

const AXES = ['Performance', 'Conforto', 'Economia', 'Off-road', 'Tecnologia', 'Segurança'];
const LEVELS = 3;

interface RadarChartProps {
  valuesA: number[];
  valuesB: number[];
  colorA: string;
  colorB: string;
  labelA: string;
  labelB: string;
  size?: number;
}

function toPoints(values: number[], cx: number, cy: number, r: number): string {
  return values
    .map((v, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length;
      const ratio = Math.max(0, Math.min(v, 10)) / 10;
      const x = cx + r * ratio * Math.cos(angle);
      const y = cy + r * ratio * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');
}

function gridPoints(level: number, cx: number, cy: number, r: number): string {
  return Array.from({ length: AXES.length }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length;
    const x = cx + r * level * Math.cos(angle);
    const y = cy + r * level * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');
}

export function RadarChart({
  valuesA,
  valuesB,
  colorA,
  colorB,
  labelA,
  labelB,
  size = 260,
}: RadarChartProps) {
  const padding = 44;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - padding;

  return (
    <View>
      <Svg width={size} height={size}>
        {/* Grade — polígonos concêntricos */}
        {Array.from({ length: LEVELS }, (_, lvl) => {
          const ratio = (lvl + 1) / LEVELS;
          return (
            <Polygon
              key={lvl}
              points={gridPoints(ratio, cx, cy, r)}
              fill="none"
              stroke="rgba(56,109,189,0.2)"
              strokeWidth={1}
            />
          );
        })}

        {/* Eixos */}
        {AXES.map((_, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length;
          return (
            <Line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + r * Math.cos(angle)}
              y2={cy + r * Math.sin(angle)}
              stroke="rgba(56,109,189,0.2)"
              strokeWidth={1}
            />
          );
        })}

        {/* Polígono veículo B (atrás) */}
        <Polygon
          points={toPoints(valuesB, cx, cy, r)}
          fill={`${colorB}22`}
          stroke={colorB}
          strokeWidth={1.5}
        />

        {/* Polígono veículo A (na frente) */}
        <Polygon
          points={toPoints(valuesA, cx, cy, r)}
          fill={`${colorA}22`}
          stroke={colorA}
          strokeWidth={1.5}
        />

        {/* Pontos nos vértices */}
        {valuesA.map((v, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length;
          const ratio = Math.max(0, Math.min(v, 10)) / 10;
          return (
            <Circle
              key={`a${i}`}
              cx={cx + r * ratio * Math.cos(angle)}
              cy={cy + r * ratio * Math.sin(angle)}
              r={3}
              fill={colorA}
            />
          );
        })}
        {valuesB.map((v, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length;
          const ratio = Math.max(0, Math.min(v, 10)) / 10;
          return (
            <Circle
              key={`b${i}`}
              cx={cx + r * ratio * Math.cos(angle)}
              cy={cy + r * ratio * Math.sin(angle)}
              r={3}
              fill={colorB}
            />
          );
        })}

        {/* Labels dos eixos */}
        {AXES.map((label, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length;
          const labelR = r + 22;
          const x = cx + labelR * Math.cos(angle);
          const y = cy + labelR * Math.sin(angle);
          const anchor =
            Math.abs(Math.cos(angle)) < 0.1
              ? 'middle'
              : Math.cos(angle) > 0
              ? 'start'
              : 'end';
          return (
            <SvgText
              key={label}
              x={x}
              y={y + 4}
              textAnchor={anchor}
              fontSize={9}
              fill={Colors.textMuted}
              fontFamily="Sora_400Regular"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colorA }]} />
          <Text style={styles.legendLabel} numberOfLines={1}>{labelA}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colorB }]} />
          <Text style={styles.legendLabel} numberOfLines={1}>{labelB}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
    maxWidth: 120,
  },
});
