import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "member" | "coach" | "admin";

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: AuthUser | null) => void;
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
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "fitzone-auth" },
  ),
);
