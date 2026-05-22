/**
 * ChatContext — gerencia o estado do chat mockado da Home.
 *
 * - Mantém a lista de mensagens visíveis (subset do `rivaScript`).
 * - A cada envio do usuário, descarta o texto digitado e avança para o
 *   próximo turno roteirizado (mensagem do usuário + resposta da RIVA).
 * - Persiste o histórico em AsyncStorage.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  rivaScript,
  rivaScenarios,
  endOfScriptReply,
  ScriptedMessage,
  RivaMessage,
} from '../mock/rivaChat';

const DEFAULT_SCENARIO_ID = rivaScenarios[0].id;

function getScenarioMessages(id: string): ScriptedMessage[] {
  return rivaScenarios.find((s) => s.id === id)?.messages ?? rivaScript;
}

const STORAGE_KEY = '@riva/chat-history';
const TYPING_DELAY_MS = 2200;

type ExtraMessage = RivaMessage & { id: string };

type ChatState = {
  messages: ScriptedMessage[];
  cursor: number;
  favorited: boolean;
  scenarioId: string;
};

interface ChatContextValue {
  messages: ScriptedMessage[];
  cursor: number;
  scenarioId: string;
  hasConversation: boolean;
  isTyping: boolean;
  isFavorited: boolean;
  sendMessage: () => void;
  resetChat: () => void;
  toggleFavorite: () => void;
  loadConversation: (snapshot: { messages: ScriptedMessage[]; cursor: number; favorited: boolean; scenarioId?: string }) => void;
  startScenario: (id: string) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    cursor: 0,
    favorited: false,
    scenarioId: DEFAULT_SCENARIO_ID,
  });
  const [isTyping, setIsTyping] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hidrata o estado a partir do AsyncStorage.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ChatState;
          if (parsed && Array.isArray(parsed.messages) && typeof parsed.cursor === 'number') {
            setState({
              messages: parsed.messages,
              cursor: parsed.cursor,
              favorited: !!parsed.favorited,
              scenarioId: typeof parsed.scenarioId === 'string' ? parsed.scenarioId : DEFAULT_SCENARIO_ID,
            });
          }
        }
      } catch {
        // ignora falhas de leitura
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Persiste a cada mudança (após hidratação).
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const sendMessage = useCallback(() => {
    setState((prev) => {
      const script = getScenarioMessages(prev.scenarioId);
      const next = script[prev.cursor];
      if (!next) {
        // Roteiro acabou: gera um turno genérico de usuário + resposta fim-de-script.
        const fallbackUser: ScriptedMessage = {
          id: `user-extra-${prev.messages.length}`,
          role: 'user',
          text: '...',
        };
        const fallbackRiva: ScriptedMessage = {
          ...(endOfScriptReply as ExtraMessage),
          id: `riva-extra-${prev.messages.length}`,
        };
        // Mostra a do usuário imediatamente; a da RIVA entra depois do typing.
        setIsTyping(true);
        setTimeout(() => {
          setState((s) => ({ ...s, messages: [...s.messages, fallbackRiva] }));
          setIsTyping(false);
        }, TYPING_DELAY_MS);
        return { ...prev, messages: [...prev.messages, fallbackUser] };
      }

      if (next.role === 'user') {
        const userMsg = next;
        const reply = script[prev.cursor + 1];
        setIsTyping(true);
        if (reply && reply.role === 'riva') {
          setTimeout(() => {
            setState((s) => ({
              ...s,
              messages: [...s.messages, reply],
              cursor: prev.cursor + 2,
            }));
            setIsTyping(false);
          }, TYPING_DELAY_MS);
          return { ...prev, messages: [...prev.messages, userMsg] };
        }
        // Só tem usuário, sem resposta seguinte — avança 1.
        setIsTyping(false);
        return { ...prev, messages: [...prev.messages, userMsg], cursor: prev.cursor + 1 };
      }

      // Próxima é da RIVA isolada (não deveria acontecer no roteiro atual).
      setIsTyping(true);
      setTimeout(() => {
        setState((s) => ({
          ...s,
          messages: [...s.messages, next],
          cursor: prev.cursor + 1,
        }));
        setIsTyping(false);
      }, TYPING_DELAY_MS);
      return prev;
    });
  }, []);

  const resetChat = useCallback(() => {
    setIsTyping(false);
    setState({ messages: [], cursor: 0, favorited: false, scenarioId: DEFAULT_SCENARIO_ID });
  }, []);

  const startScenario = useCallback((id: string) => {
    setIsTyping(false);
    setState({ messages: [], cursor: 0, favorited: false, scenarioId: id });
    // Dispara o 1º turno do roteiro escolhido no próximo tick (depois do reset).
    setTimeout(() => sendMessage(), 0);
  }, []);

  const toggleFavorite = useCallback(() => {
    setState((prev) => ({ ...prev, favorited: !prev.favorited }));
  }, []);

  const loadConversation = useCallback(
    (snapshot: { messages: ScriptedMessage[]; cursor: number; favorited: boolean; scenarioId?: string }) => {
      setIsTyping(false);
      setState({
        messages: snapshot.messages,
        cursor: snapshot.cursor,
        favorited: snapshot.favorited,
        scenarioId: snapshot.scenarioId ?? DEFAULT_SCENARIO_ID,
      });
    },
    [],
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      messages: state.messages,
      cursor: state.cursor,
      scenarioId: state.scenarioId,
      hasConversation: state.messages.length > 0,
      isTyping,
      isFavorited: state.favorited,
      sendMessage,
      resetChat,
      toggleFavorite,
      loadConversation,
      startScenario,
    }),
    [state.messages, state.cursor, state.scenarioId, state.favorited, isTyping, sendMessage, resetChat, toggleFavorite, loadConversation, startScenario],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
