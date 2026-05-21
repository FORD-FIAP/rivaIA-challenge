import React, { createContext, useContext } from 'react';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

interface RecentlyViewedContextValue {
  recent: string[];
  trackView: (id: string) => void;
  clearRecent: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue>({
  recent: [],
  trackView: () => {},
  clearRecent: () => {},
});

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const value = useRecentlyViewed();
  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewedContext() {
  return useContext(RecentlyViewedContext);
}
