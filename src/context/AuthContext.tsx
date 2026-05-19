import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle } from '../types/vehicle';

interface User {
  fullName: string;
  nickname: string;
  email: string;
  preferences: string;
  /** Compat: alguns componentes (Header, Sidebar) leem user.name como apelido curto. */
  name: string;
}

export type AuthPromptContext =
  | { type: 'vehicle'; vehicle: Vehicle }
  | { type: 'comparison'; vehicleA: Vehicle; vehicleB: Vehicle }
  | { type: 'chat' }
  | { type: 'login' };

interface RegisterPayload {
  fullName: string;
  email: string;
}

interface ProfileUpdates {
  nickname?: string;
  email?: string;
  preferences?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (payload: RegisterPayload) => void;
  updateProfile: (updates: ProfileUpdates) => void;
  logout: () => void;
  authPrompt: AuthPromptContext | null;
  requestLogin: (ctx: AuthPromptContext, onSuccess?: () => void) => void;
  closeLogin: () => void;
  runPendingAction: () => void;
}

const STORAGE_KEY = '@riva/user';

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  updateProfile: () => {},
  logout: () => {},
  authPrompt: null,
  requestLogin: () => {},
  closeLogin: () => {},
  runPendingAction: () => {},
});

function firstNameOf(full: string): string {
  return full.trim().split(/\s+/)[0] ?? '';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [authPrompt, setAuthPrompt] = useState<AuthPromptContext | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as User;
          if (parsed && parsed.fullName) setUser(parsed);
        }
      } catch {
        /* noop */
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user)).catch(() => {});
    else AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, [user, hydrated]);

  function login({ fullName, email }: RegisterPayload) {
    const nickname = firstNameOf(fullName);
    setUser({
      fullName: fullName.trim(),
      nickname,
      email: email.trim(),
      preferences: '',
      name: nickname,
    });
  }

  function updateProfile(updates: ProfileUpdates) {
    setUser((prev) => {
      if (!prev) return prev;
      const next: User = {
        ...prev,
        ...updates,
        nickname: updates.nickname ?? prev.nickname,
        name: updates.nickname ?? prev.nickname,
      };
      return next;
    });
  }

  function requestLogin(ctx: AuthPromptContext, onSuccess?: () => void) {
    setAuthPrompt(ctx);
    setPendingAction(() => onSuccess ?? null);
  }

  function closeLogin() {
    setAuthPrompt(null);
    setPendingAction(null);
  }

  function runPendingAction() {
    if (pendingAction) pendingAction();
    setPendingAction(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        updateProfile,
        logout: () => setUser(null),
        authPrompt,
        requestLogin,
        closeLogin,
        runPendingAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}