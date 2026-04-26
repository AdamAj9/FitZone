import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApi } from "../api/auth";
import { useAuthStore } from "../store/auth";
import type { LoginPayload, RegisterPayload } from "../types/auth";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.access, data.refresh);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.access, data.refresh);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useLogout() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logoutStore = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch {
          /* token may already be invalid — ignore */
        }
      }
    },
    onSettled: () => {
      logoutStore();
      queryClient.clear();
    },
  });
}

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const user = await authApi.me();
      setUser(user);
      return user;
    },
    enabled: Boolean(accessToken),
    staleTime: 5 * 60_000,
  });
}
