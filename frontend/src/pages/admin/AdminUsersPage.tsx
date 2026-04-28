import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { adminApi } from "../../api/admin";
import type { AdminUser } from "../../types/admin";
import { formatDateTime } from "../../lib/date";

const roleColor: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  coach: "bg-brand-100 text-brand-700",
  member: "bg-slate-100 text-slate-700",
};

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", { search, role }],
    queryFn: () =>
      adminApi.listUsers({ search: search || undefined, role: role || undefined }),
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleActive(id),
    onSuccess: invalidate,
  });

  const setRoleMutation = useMutation({
    mutationFn: ({ id, newRole }: { id: number; newRole: AdminUser["role"] }) =>
      adminApi.setRole(id, newRole),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
      </div>

      <div className="flex gap-3">
        <input
          type="search"
          placeholder="Rechercher email ou nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Tous rôles</option>
          <option value="member">Membre</option>
          <option value="coach">Coach</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-slate-500">Chargement...</p>
        ) : (data?.results.length ?? 0) === 0 ? (
          <p className="p-8 text-center text-slate-500">Aucun utilisateur.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Inscription</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.results.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-slate-900">{u.email}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        setRoleMutation.mutate({
                          id: u.id,
                          newRole: e.target.value as AdminUser["role"],
                        })
                      }
                      disabled={setRoleMutation.isPending}
                      className={`rounded-md border-0 bg-transparent px-2 py-1 text-xs font-medium ${
                        roleColor[u.role]
                      }`}
                    >
                      <option value="member">Membre</option>
                      <option value="coach">Coach</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        u.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.is_active ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {formatDateTime(u.date_joined)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate(u.id)}
                      disabled={toggleMutation.isPending}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
                    >
                      {u.is_active ? "Désactiver" : "Réactiver"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
