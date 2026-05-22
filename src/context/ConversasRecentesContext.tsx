import React, { createContext, useContext } from 'react';
import { useConversasRecentes, ConversaArquivada } from '../hooks/useConversasRecentes';

interface ConversasRecentesContextValue {
  conversas: ConversaArquivada[];
  arquivar: (conversa: ConversaArquivada) => void;
  limpar: () => void;
}

const ConversasRecentesContext = createContext<ConversasRecentesContextValue>({
  conversas: [],
  arquivar: () => {},
  limpar: () => {},
});

export function ConversasRecentesProvider({ children }: { children: React.ReactNode }) {
  const value = useConversasRecentes();
  return (
    <ConversasRecentesContext.Provider value={value}>
      {children}
    </ConversasRecentesContext.Provider>
  );
}

export function useConversasRecentesContext() {
  return useContext(ConversasRecentesContext);
}
