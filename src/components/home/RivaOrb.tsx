/** Orb da RIVA — gradiente radial com glow e animação de pulse */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export function RivaOrb() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  return (
    <View style={styles.container}>
      {/* Halo de glow externo */}
      <Animated.View style={[styles.glow, { transform: [{ scale: pulse }] }]} />
      {/* Orb principal */}
      <View style={styles.orb} />
      {/* Reflexo interno */}
      <View style={styles.shine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,157,221,0.25)',
  },
  orb: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.28)',
    top: 9,
    left: 11,
  },
});
