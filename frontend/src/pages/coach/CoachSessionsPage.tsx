import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { coachApi } from "../../api/coach";
import { sessionsApi } from "../../api/sessions";
import { formatDateTime } from "../../lib/date";
import type { CoachSessionWritePayload } from "../../types/coach";

const emptyForm: CoachSessionWritePayload = {
  course: 0,
  room: 0,
  starts_at: "",
  ends_at: "",
};

export function CoachSessionsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CoachSessionWritePayload>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const coursesQuery = useQuery({
    queryKey: ["coach-courses"],
    queryFn: () => coachApi.myCourses(),
  });
  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: () => sessionsApi.listRooms(),
  });
  const sessionsQuery = useQuery({
    queryKey: ["coach-sessions"],
    queryFn: () => coachApi.mySessions(),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["coach-sessions"] });
    void queryClient.invalidateQueries({ queryKey: ["coach-dashboard"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CoachSessionWritePayload) =>
      coachApi.createSession(payload),
    onSuccess: () => {
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<CoachSessionWritePayload>;
    }) => coachApi.updateSession(id, payload),
    onSuccess: () => {
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => coachApi.deleteSession(id),
    onSuccess: invalidate,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const apiError = (createMutation.error ?? updateMutation.error) as
    | { response?: { data?: Record<string, unknown> } }
    | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mes séances</h1>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Planifier une séance
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Cours</label>
              <select
                value={form.course}
                onChange={(e) =>
                  setForm({ ...form, course: Number(e.target.value) })
                }
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">— Choisir —</option>
                {coursesQuery.data?.results.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Salle</label>
              <select
                value={form.room}
                onChange={(e) =>
                  setForm({ ...form, room: Number(e.target.value) })
                }
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">— Choisir —</option>
                {roomsQuery.data?.results.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.building_display})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Début
              </label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) =>
                  setForm({ ...form, starts_at: e.target.value })
                }
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Fin</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) =>
                  setForm({ ...form, ends_at: e.target.value })
                }
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Capacité (optionnel)
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    capacity: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Reprend la capacité du cours"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          {apiError?.response?.data && (
            <pre className="overflow-auto rounded-md bg-red-50 p-3 text-xs text-red-700">
              {JSON.stringify(apiError.response.data, null, 2)}
            </pre>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {editingId ? "Enregistrer" : "Planifier"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {sessionsQuery.isLoading ? (
          <p className="p-8 text-center text-slate-500">Chargement...</p>
        ) : (sessionsQuery.data?.results.length ?? 0) === 0 ? (
          <p className="p-8 text-center text-slate-500">
            Aucune séance planifiée.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Cours</th>
                <th className="px-4 py-3 font-medium">Salle</th>
                <th className="px-4 py-3 font-medium">Places</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessionsQuery.data?.results.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-slate-900">
                    {formatDateTime(s.starts_at)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{s.course_title}</td>
                  <td className="px-4 py-3 text-slate-700">{s.room_name}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {s.seats_taken}/{s.capacity}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        s.status === "scheduled"
                          ? "bg-green-100 text-green-700"
                          : s.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Supprimer cette séance ?")) {
                          deleteMutation.mutate(s.id);
                        }
                      }}
                      className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      Supprimer
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
