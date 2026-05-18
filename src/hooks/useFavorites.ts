import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = '@riva_favorites';
const COMPARISON_KEY = '@riva_favorite_comparisons';

export type ComparisonPair = [string, string];

function sortPair(a: string, b: string): ComparisonPair {
  return a < b ? [a, b] : [b, a];
}

function pairsEqual(p: ComparisonPair, q: ComparisonPair): boolean {
  return p[0] === q[0] && p[1] === q[1];
}

function load<T>(key: string, fallback: T): T {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }
  } catch {}
  return fallback;
}

function save<T>(key: string, value: T) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {}
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => load(STORAGE_KEY, [] as string[]));
  const [comparisons, setComparisons] = useState<ComparisonPair[]>(() =>
    load(COMPARISON_KEY, [] as ComparisonPair[]),
  );

  useEffect(() => {
    setFavorites(load(STORAGE_KEY, [] as string[]));
    setComparisons(load(COMPARISON_KEY, [] as ComparisonPair[]));
  }, []);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      save(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleComparison = useCallback((idA: string, idB: string) => {
    const pair = sortPair(idA, idB);
    setComparisons((prev) => {
      const exists = prev.some((p) => pairsEqual(p, pair));
      const next = exists ? prev.filter((p) => !pairsEqual(p, pair)) : [...prev, pair];
      save(COMPARISON_KEY, next);
      return next;
    });
  }, []);

  const isComparisonFavorite = useCallback(
    (idA: string, idB: string) => {
      const pair = sortPair(idA, idB);
      return comparisons.some((p) => pairsEqual(p, pair));
    },
    [comparisons],
  );

  return { favorites, toggle, isFavorite, comparisons, toggleComparison, isComparisonFavorite };
}
