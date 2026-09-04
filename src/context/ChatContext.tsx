/**
 * ChatContext — gerencia o estado do chat da Home.
 *
 * Ainda não existe IA de verdade por trás (isso chega com o backend +
 * Gemini Flash). Por enquanto, toda mensagem do usuário é exibida de
 * verdade e recebe uma resposta fixa avisando que a IA está em construção.
 * Persiste o histórico em AsyncStorage e arquiva a conversa em
 * ConversasRecentesContext para aparecer na Sidebar.
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
import { useAuth } from './AuthContext';
import { useConversasRecentesContext } from './ConversasRecentesContext';
import { ChatMessage } from '../hooks/useConversasRecentes';

export type { ChatMessage };

const STORAGE_KEY = '@riva/chat-history';
const TYPING_DELAY_MS = 1200;
const RESPOSTA_EM_CONSTRUCAO =
  'A IA da RIVA ainda está em construção — em breve as respostas vão ser geradas de verdade por aqui.';

type ChatState = {
  messages: ChatMessage[];
  favorited: boolean;
};

interface ChatContextValue {
  messages: ChatMessage[];
  hasConversation: boolean;
  isTyping: boolean;
  isFavorited: boolean;
  sendMessage: (text: string) => void;
  resetChat: () => void;
  toggleFavorite: () => void;
  loadConversation: (snapshot: { messages: ChatMessage[]; favorited: boolean }) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { arquivar } = useConversasRecentesContext();
  const [state, setState] = useState<ChatState>({ messages: [], favorited: false });
  const [isTyping, setIsTyping] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hidrata o estado a partir do AsyncStorage.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ChatState;
          if (parsed && Array.isArray(parsed.messages)) {
            setState({ messages: parsed.messages, favorited: !!parsed.favorited });
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

  // Arquiva a conversa em andamento pra aparecer em "Recentes" na Sidebar.
  useEffect(() => {
    if (!isAuthenticated || state.messages.length === 0) return;
    const primeiraMsgUsuario = state.messages.find((m) => m.role === 'user');
    if (!primeiraMsgUsuario) return;
    arquivar({
      titulo: primeiraMsgUsuario.text,
      messages: state.messages,
      favorited: state.favorited,
    });
  }, [state.messages, state.favorited, isAuthenticated]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: trimmed };
    setState((prev) => ({ ...prev, messages: [...prev.messages, userMsg] }));
    setIsTyping(true);
    setTimeout(() => {
      const rivaMsg: ChatMessage = { id: `riva-${Date.now()}`, role: 'riva', text: RESPOSTA_EM_CONSTRUCAO };
      setState((prev) => ({ ...prev, messages: [...prev.messages, rivaMsg] }));
      setIsTyping(false);
    }, TYPING_DELAY_MS);
  }, []);

  const resetChat = useCallback(() => {
    setIsTyping(false);
    setState({ messages: [], favorited: false });
  }, []);

  const toggleFavorite = useCallback(() => {
    setState((prev) => ({ ...prev, favorited: !prev.favorited }));
  }, []);

  const loadConversation = useCallback(
    (snapshot: { messages: ChatMessage[]; favorited: boolean }) => {
      setIsTyping(false);
      setState({ messages: snapshot.messages, favorited: snapshot.favorited });
    },
    [],
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      messages: state.messages,
      hasConversation: state.messages.length > 0,
      isTyping,
      isFavorited: state.favorited,
      sendMessage,
      resetChat,
      toggleFavorite,
      loadConversation,
    }),
    [state.messages, state.favorited, isTyping, sendMessage, resetChat, toggleFavorite, loadConversation],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
