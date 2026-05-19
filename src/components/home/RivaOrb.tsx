/** Orb da RIVA — gradiente radial com glow e animação de pulse */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface RivaOrbProps {
  size?: number;
}

export function RivaOrb({ size = 56 }: RivaOrbProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  const radius = size / 2;
  const shineSize = Math.round(size * 0.32);
  const shineRadius = shineSize / 2;
  const shineOffset = Math.round(size * 0.16);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Halo de glow externo */}
      <Animated.View
        style={[
          styles.glow,
          { width: size, height: size, borderRadius: radius },
          { transform: [{ scale: pulse }] },
        ]}
      />
      {/* Orb principal */}
      <View style={[styles.orb, { width: size, height: size, borderRadius: radius }]} />
      {/* Reflexo interno */}
      <View
        style={[
          styles.shine,
          {
            width: shineSize,
            height: shineSize,
            borderRadius: shineRadius,
            top: shineOffset,
            left: shineOffset + 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,157,221,0.25)',
  },
  orb: {
    /** Aproximação do gradiente radial: centro claro (#6FD7FF) → escuro (#0F4571) */
    backgroundColor: '#009DDD',
    shadowColor: '#009DDD',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 16,
  },
  shine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
});
