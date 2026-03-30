'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';
import type { AuthTokens } from '@medconnect/shared';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, tokens: AuthTokens) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const tokens = await api.post<AuthTokens>('/auth/login', { email, password });
        // Decode JWT to get user info
        const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
        const user: User = {
          id: payload.sub,
          email: payload.email,
          firstName: '',
          lastName: '',
          role: payload.role,
        };
        set({ user, accessToken: tokens.accessToken, isAuthenticated: true });
      },

      register: async (data) => {
        const tokens = await api.post<AuthTokens>('/auth/register', data);
        const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
        const user: User = {
          id: payload.sub,
          email: payload.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: payload.role,
        };
        set({ user, accessToken: tokens.accessToken, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setAuth: (user: User, tokens: AuthTokens) => {
        set({ user, accessToken: tokens.accessToken, isAuthenticated: true });
      },
    }),
    {
      name: 'medconnect-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
