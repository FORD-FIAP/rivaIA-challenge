import React, { createContext, useContext } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import type { ComparisonPair } from '../hooks/useFavorites';

interface FavoritesContextValue {
  favorites: string[];
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
  comparisons: ComparisonPair[];
  toggleComparison: (idA: string, idB: string) => void;
  isComparisonFavorite: (idA: string, idB: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  toggle: () => {},
  isFavorite: () => false,
  comparisons: [],
  toggleComparison: () => {},
  isComparisonFavorite: () => false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const value = useFavorites();
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavoritesContext() {
  return useContext(FavoritesContext);
}
