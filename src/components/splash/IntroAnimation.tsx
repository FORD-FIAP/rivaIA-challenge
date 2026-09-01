/** Animação de abertura — "RIVA" entra centralizado e as letras saem voando em direções diferentes */
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { Colors } from '../../theme/colors';

interface IntroAnimationProps {
  onFinish: () => void;
}

const LETTERS = ['R', 'I', 'V', 'A'];

/** Para onde cada letra voa na saída — espalhadas pra fora da tela em direções distintas. */
const EXIT_OFFSETS: { x: number; y: number; rotate: string }[] = [
  { x: -420, y: -260, rotate: '-35deg' },
  { x: -160, y: 420,  rotate: '20deg'  },
  { x: 160,  y: -420, rotate: '-20deg' },
  { x: 420,  y: 260,  rotate: '35deg'  },
];

const HOLD_MS = 850;
const ENTER_MS = 450;
const EXIT_MS = 600;

export function IntroAnimation({ onFinish }: IntroAnimationProps) {
  const enterAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(1)).current;
  const letterAnims = useRef(LETTERS.map(() => new Animated.ValueXY({ x: 0, y: 0 }))).current;
  const letterOpacity = useRef(LETTERS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.timing(enterAnim, {
      toValue: 1,
      duration: ENTER_MS,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start(() => {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(backgroundAnim, {
            toValue: 0,
            duration: EXIT_MS,
            useNativeDriver: true,
          }),
          ...letterAnims.map((anim, i) =>
            Animated.timing(anim, {
              toValue: { x: EXIT_OFFSETS[i].x, y: EXIT_OFFSETS[i].y },
              duration: EXIT_MS,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ),
          ...letterOpacity.map((anim) =>
            Animated.timing(anim, {
              toValue: 0,
              duration: EXIT_MS,
              delay: EXIT_MS * 0.3,
              useNativeDriver: true,
            }),
          ),
        ]).start(onFinish);
      }, HOLD_MS);
      return () => clearTimeout(timer);
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: backgroundAnim }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.word,
          {
            opacity: enterAnim,
            transform: [{ scale: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          },
        ]}
      >
        {LETTERS.map((letter, i) => (
          <Animated.Text
            key={letter + i}
            style={[
              styles.letter,
              letter === 'I' && styles.letterAccent,
              {
                opacity: letterOpacity[i],
                transform: [
                  { translateX: letterAnims[i].x },
                  { translateY: letterAnims[i].y },
                  {
                    rotate: letterAnims[i].x.interpolate({
                      inputRange: [Math.min(0, EXIT_OFFSETS[i].x), Math.max(0, EXIT_OFFSETS[i].x)],
                      outputRange: EXIT_OFFSETS[i].x < 0 ? [EXIT_OFFSETS[i].rotate, '0deg'] : ['0deg', EXIT_OFFSETS[i].rotate],
                    }),
                  },
                ],
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  word: {
    flexDirection: 'row',
  },
  letter: {
    color: Colors.textPrimary,
    fontSize: 72,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    letterSpacing: 4,
  },
  letterAccent: {
    color: Colors.accent,
  },
});
