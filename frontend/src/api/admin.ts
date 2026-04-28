import { apiClient } from "./client";
import type {
  AdminDashboard,
  AdminUser,
  AdminUsersPage,
  AuditLogsPage,
} from "../types/admin";

export const adminApi = {
  async dashboard(): Promise<AdminDashboard> {
    const { data } = await apiClient.get<AdminDashboard>("/admin/dashboard/");
    return data;
  },

  async listUsers(params: {
    role?: string;
    is_active?: boolean;
    search?: string;
  } = {}): Promise<AdminUsersPage> {
    const query: Record<string, string> = {};
    if (params.role) query.role = params.role;
    if (params.is_active !== undefined)
      query.is_active = String(params.is_active);
    if (params.search) query.search = params.search;
    const { data } = await apiClient.get<AdminUsersPage>("/admin/users/", {
      params: query,
    });
    return data;
  },

  async toggleActive(id: number): Promise<AdminUser> {
    const { data } = await apiClient.post<AdminUser>(
      `/admin/users/${id}/toggle-active/`,
    );
    return data;
  },

  async setRole(id: number, role: "member" | "coach" | "admin"): Promise<AdminUser> {
    const { data } = await apiClient.post<AdminUser>(
      `/admin/users/${id}/set-role/`,
      { role },
    );
    return data;
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/admin/users/${id}/`);
  },

  async listLogs(params: { action?: string } = {}): Promise<AuditLogsPage> {
    const { data } = await apiClient.get<AuditLogsPage>("/admin/logs/", {
      params,
    });
    return data;
  },
};
