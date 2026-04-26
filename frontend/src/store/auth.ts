import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "../types/auth";

export type { Role } from "../types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setAuth: (user: User, access: string, refresh: string) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setUser: (user) => set({ user }),
      setAuth: (user, access, refresh) =>
        set({ user, accessToken: access, refreshToken: refresh }),
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "fitzone-auth" },
  ),
);
