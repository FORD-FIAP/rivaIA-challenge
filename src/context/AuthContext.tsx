import React, { createContext, useContext, useState } from 'react';
import { Vehicle } from '../types/vehicle';

interface User {
  name: string;
}

export type AuthPromptContext =
  | { type: 'vehicle'; vehicle: Vehicle }
  | { type: 'comparison'; vehicleA: Vehicle; vehicleB: Vehicle }
  | { type: 'chat' }
  | { type: 'login' };

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  authPrompt: AuthPromptContext | null;
  requestLogin: (ctx: AuthPromptContext, onSuccess?: () => void) => void;
  closeLogin: () => void;
  runPendingAction: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  authPrompt: null,
  requestLogin: () => {},
  closeLogin: () => {},
  runPendingAction: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authPrompt, setAuthPrompt] = useState<AuthPromptContext | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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
        login: setUser,
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
