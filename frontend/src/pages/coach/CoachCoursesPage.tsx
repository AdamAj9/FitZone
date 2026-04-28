import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import toast from "react-hot-toast";

import { coachApi } from "../../api/coach";
import { coursesApi } from "../../api/courses";
import { ConfirmDialog } from "../../components/ui";
import { apiErrorMessage } from "../../lib/errors";
import { useAuthStore } from "../../store/auth";
import type { CoachCourseWritePayload } from "../../types/coach";
import type { CourseListItem } from "../../types/courses";

const emptyForm: CoachCourseWritePayload = {
  title: "",
  description: "",
  category: 0,
  level: "all",
  duration_minutes: 60,
  capacity: 15,
  price_unit: "0",
  is_active: true,
};

export function CoachCoursesPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [editing, setEditing] = useState<CourseListItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CoachCourseWritePayload>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<CourseListItem | null>(null);

  const coursesQuery = useQuery({
    queryKey: ["coach-courses", user?.id],
    queryFn: () => coachApi.myCourses(user!.id),
    enabled: Boolean(user?.id),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => coursesApi.listCategories(),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["coach-courses"] });
    void queryClient.invalidateQueries({ queryKey: ["coach-dashboard"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CoachCourseWritePayload) =>
      coachApi.createCourse(payload),
    onSuccess: () => {
      toast.success("Cours créé");
      setShowForm(false);
      setForm(emptyForm);
      invalidate();
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Création impossible")),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      slug,
      payload,
    }: {
      slug: string;
      payload: Partial<CoachCourseWritePayload>;
    }) => coachApi.updateCourse(slug, payload),
    onSuccess: () => {
      toast.success("Cours mis à jour");
      setEditing(null);
      setForm(emptyForm);
      setShowForm(false);
      invalidate();
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Mise à jour impossible")),
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => coachApi.deleteCourse(slug),
    onSuccess: () => {
      toast.success("Cours supprimé");
      setPendingDelete(null);
      invalidate();
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Suppression impossible")),
  });

  const startEdit = (c: CourseListItem) => {
    setEditing(c);
    const cat = categoriesQuery.data?.results.find(
      (k) => k.slug === c.category_slug,
    );
    setForm({
      title: c.title,
      description: "",
      category: cat?.id ?? 0,
      level: c.level,
      duration_minutes: c.duration_minutes,
      capacity: c.capacity,
      price_unit: c.price_unit,
      is_active: c.is_active,
    });
    setShowForm(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ slug: editing.slug, payload: form });
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
        <h1 className="text-2xl font-bold text-slate-900">Mes cours</h1>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Nouveau cours
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Titre</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Catégorie
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: Number(e.target.value) })
                }
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">— Choisir —</option>
                {categoriesQuery.data?.results.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Niveau
              </label>
              <select
                value={form.level}
                onChange={(e) =>
                  setForm({
                    ...form,
                    level: e.target.value as CoachCourseWritePayload["level"],
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="all">Tous niveaux</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Durée (min)
              </label>
              <input
                type="number"
                min="15"
                max="240"
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm({ ...form, duration_minutes: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Capacité
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Prix unitaire (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price_unit}
                onChange={(e) =>
                  setForm({ ...form, price_unit: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              Actif
            </label>
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
                setEditing(null);
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
              {editing ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {coursesQuery.isLoading ? (
          <p className="p-8 text-center text-slate-500">Chargement...</p>
        ) : (coursesQuery.data?.results.length ?? 0) === 0 ? (
          <p className="p-8 text-center text-slate-500">
            Aucun cours pour le moment.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Titre</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium">Niveau</th>
                <th className="px-4 py-3 font-medium">Durée</th>
                <th className="px-4 py-3 font-medium">Prix</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coursesQuery.data?.results.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {c.title}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.category}</td>
                  <td className="px-4 py-3 text-slate-700">{c.level}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {c.duration_minutes} min
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {Number(c.price_unit).toFixed(2)} €
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        c.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {c.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(c)}
                        className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer ce cours ?"
        description={
          pendingDelete
            ? `« ${pendingDelete.title} » sera retiré du catalogue. Les séances déjà planifiées seront aussi supprimées.`
            : ""
        }
        confirmLabel="Supprimer"
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.slug)}
        onCancel={() => setPendingDelete(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
