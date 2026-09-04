import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@riva/conversas_recentes';
const MAX_ITEMS = 10;

export interface ChatMessage {
  id: string;
  role: 'user' | 'riva';
  text: string;
}

export type ConversaArquivada = {
  titulo: string;
  messages: ChatMessage[];
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

async function load(): Promise<ConversaArquivada[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValid);
  } catch {
    return [];
  }
}

function save(value: ConversaArquivada[]) {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value)).catch(() => {});
}

export function useConversasRecentes() {
  const [conversas, setConversas] = useState<ConversaArquivada[]>([]);

  useEffect(() => {
    // Sobrescreve o storage com a versão saneada (descarta entries inválidos
    // que possam ter sobrado de versões anteriores).
    load().then((loaded) => {
      setConversas(loaded);
      save(loaded);
    });
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
