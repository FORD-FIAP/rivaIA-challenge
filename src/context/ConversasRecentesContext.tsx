import React, { createContext, useContext } from 'react';
import { useConversasRecentes, ConversaArquivada } from '../hooks/useConversasRecentes';

interface ConversasRecentesContextValue {
  conversas: ConversaArquivada[];
  arquivar: (conversa: ConversaArquivada) => void;
  limpar: () => void;
  remover: (titulo: string) => void;
  renomear: (tituloAntigo: string, novoTitulo: string) => void;
}

const ConversasRecentesContext = createContext<ConversasRecentesContextValue>({
  conversas: [],
  arquivar: () => {},
  limpar: () => {},
  remover: () => {},
  renomear: () => {},
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
