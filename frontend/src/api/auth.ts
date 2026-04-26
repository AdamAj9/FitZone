import { apiClient } from "./client";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/auth";

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/register/",
      payload,
    );
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/login/", payload);
    return data;
  },

  async logout(refresh: string): Promise<void> {
    await apiClient.post("/auth/logout/", { refresh });
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me/");
    return data;
  },

  async updateMe(payload: Partial<User>): Promise<User> {
    const { data } = await apiClient.patch<User>("/auth/me/", payload);
    return data;
  },
};
