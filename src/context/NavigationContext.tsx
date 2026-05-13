import React, { createContext, useContext, useState } from 'react';

export type AppScreen = 'Início' | 'Veículos' | 'Comparar';

interface NavigationContextValue {
  activeScreen: AppScreen;
  navigate: (screen: AppScreen) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('Início');

  return (
    <NavigationContext.Provider value={{ activeScreen, navigate: setActiveScreen }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider');
  return ctx;
}