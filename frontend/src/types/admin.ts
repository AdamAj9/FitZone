import type { Paginated } from "./courses";

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "member" | "coach" | "admin";
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface AuditLogEntry {
  id: number;
  actor: number | null;
  actor_email: string | null;
  action: string;
  action_display: string;
  target_type: string;
  target_id: number | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface AdminDashboard {
  users: { total: number; members: number; coaches: number };
  active_subscriptions: number;
  revenue_last_30_days: string;
  bookings_last_30_days: number;
  top_actions: { action: string; count: number }[];
}

export type AdminUsersPage = Paginated<AdminUser>;
export type AuditLogsPage = Paginated<AuditLogEntry>;
