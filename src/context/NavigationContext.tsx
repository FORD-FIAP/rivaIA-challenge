import React, { createContext, useContext, useState } from 'react';

export type AppScreen = 'Início' | 'Veículos' | 'Comparar' | 'Perfil';

interface NavigationContextValue {
  activeScreen: AppScreen;
  navigate: (screen: AppScreen) => void;
  pendingVehicleId: string | null;
  openVehicle: (vehicleId: string) => void;
  clearPendingVehicle: () => void;
  pendingComparisonIds: [string, string] | null;
  openComparison: (idA: string, idB: string) => void;
  clearPendingComparison: () => void;
  pendingCompareVehicleId: string | null;
  openCompareWithVehicle: (vehicleId: string) => void;
  clearPendingCompareVehicle: () => void;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('Início');
  const [pendingVehicleId, setPendingVehicleId] = useState<string | null>(null);
  const [pendingComparisonIds, setPendingComparisonIds] = useState<[string, string] | null>(null);
  const [pendingCompareVehicleId, setPendingCompareVehicleId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function openVehicle(vehicleId: string) {
    setPendingVehicleId(vehicleId);
    setActiveScreen('Veículos');
  }

  function clearPendingVehicle() {
    setPendingVehicleId(null);
  }

  function openComparison(idA: string, idB: string) {
    setPendingComparisonIds([idA, idB]);
    setActiveScreen('Comparar');
  }

  function clearPendingComparison() {
    setPendingComparisonIds(null);
  }

  function openCompareWithVehicle(vehicleId: string) {
    setPendingCompareVehicleId(vehicleId);
    setActiveScreen('Comparar');
  }

  function clearPendingCompareVehicle() {
    setPendingCompareVehicleId(null);
  }

  return (
    <NavigationContext.Provider
      value={{
        activeScreen,
        navigate: setActiveScreen,
        pendingVehicleId,
        openVehicle,
        clearPendingVehicle,
        pendingComparisonIds,
        openComparison,
        clearPendingComparison,
        pendingCompareVehicleId,
        openCompareWithVehicle,
        clearPendingCompareVehicle,
        sidebarOpen,
        openSidebar: () => setSidebarOpen(true),
        closeSidebar: () => setSidebarOpen(false),
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider');
  return ctx;
}