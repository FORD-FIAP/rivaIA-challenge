import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { ScriptedMessage } from '../mock/rivaChat';

const STORAGE_KEY = '@riva/conversas_recentes';
const MAX_ITEMS = 10;

export type ConversaArquivada = {
  titulo: string;
  messages: ScriptedMessage[];
  cursor: number;
  favorited: boolean;
};

function isValid(item: any): item is ConversaArquivada {
  return (
    item &&
    typeof item.titulo === 'string' &&
    item.titulo.trim().length > 0 &&
    Array.isArray(item.messages) &&
    item.messages.length > 0
  );
}

function load(): ConversaArquivada[] {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isValid);
    }
  } catch {}
  return [];
}

function save(value: ConversaArquivada[]) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  } catch {}
}

export function useConversasRecentes() {
  const [conversas, setConversas] = useState<ConversaArquivada[]>(() => load());

  // Sobrescreve o storage com a versão saneada (descarta entries inválidos
  // que possam ter sobrado de versões anteriores).
  useEffect(() => {
    save(conversas);
    // só na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const arquivar = useCallback((conversa: ConversaArquivada) => {
    const titulo = conversa.titulo.trim();
    if (!titulo) return;
    if (!conversa.messages || conversa.messages.length === 0) return;
    setConversas((prev) => {
      // Upsert pelo título: substitui entrada existente (mantém na mesma posição
      // movida pro topo) com snapshot mais novo.
      const semDuplicata = prev.filter((c) => c.titulo !== titulo);
      const next = [{ ...conversa, titulo }, ...semDuplicata].slice(0, MAX_ITEMS);
      save(next);
      return next;
    });
  }, []);

  const limpar = useCallback(() => {
    setConversas([]);
    save([]);
  }, []);

  return { conversas, arquivar, limpar };
}
