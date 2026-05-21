import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = '@riva/recently_viewed';
const MAX_ITEMS = 8;

function load(): string[] {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
  } catch {}
  return [];
}

function save(value: string[]) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  } catch {}
}

export function useRecentlyViewed() {
  const [recent, setRecent] = useState<string[]>(() => load());

  const trackView = useCallback((id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_ITEMS);
      save(next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    save([]);
  }, []);

  return { recent, trackView, clearRecent };
}
