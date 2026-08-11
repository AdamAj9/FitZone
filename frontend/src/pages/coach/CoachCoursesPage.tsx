import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const levelLabel: Record<string, string> = {
    beginner: t("common.levels.beginner"),
    intermediate: t("common.levels.intermediate"),
    advanced: t("common.levels.advanced"),
    all: t("common.levels.all"),
  };
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
      toast.success(t("coachCourses.created"));
      setShowForm(false);
      setForm(emptyForm);
      invalidate();
    },
    onError: (e) => toast.error(apiErrorMessage(e, t("coachCourses.createError"))),
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
      toast.success(t("coachCourses.updated"));
      setEditing(null);
      setForm(emptyForm);
      setShowForm(false);
      invalidate();
    },
    onError: (e) => toast.error(apiErrorMessage(e, t("coachCourses.updateError"))),
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => coachApi.deleteCourse(slug),
    onSuccess: () => {
      toast.success(t("coachCourses.deleted"));
      setPendingDelete(null);
      invalidate();
    },
    onError: (e) => toast.error(apiErrorMessage(e, t("coachCourses.deleteError"))),
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
        <h1 className="text-2xl font-bold text-slate-900">{t("coachDashboard.myCourses")}</h1>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + {t("coachCourses.newCourse")}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl bg-surface p-6 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">{t("coachCourses.fieldTitle")}</label>
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
                {t("coachCourses.fieldCategory")}
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: Number(e.target.value) })
                }
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">— {t("coachCourses.choose")} —</option>
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
              {t("coachCourses.fieldDescription")}
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
                {t("coachCourses.fieldLevel")}
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
                <option value="all">{t("common.levels.all")}</option>
                <option value="beginner">{t("common.levels.beginner")}</option>
                <option value="intermediate">{t("common.levels.intermediate")}</option>
                <option value="advanced">{t("common.levels.advanced")}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                {t("coachCourses.fieldDuration")}
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
                {t("coachCourses.fieldCapacity")}
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
                {t("coachCourses.fieldUnitPrice")}
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
              {t("coachCourses.active")}
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
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {editing ? t("profile.save") : t("common.create")}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
        {coursesQuery.isLoading ? (
          <p className="p-8 text-center text-slate-500">{t("common.loading")}</p>
        ) : (coursesQuery.data?.results.length ?? 0) === 0 ? (
          <p className="p-8 text-center text-slate-500">
            {t("coachCourses.empty")}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("coachCourses.fieldTitle")}</th>
                <th className="px-4 py-3 font-medium">{t("coachCourses.fieldCategory")}</th>
                <th className="px-4 py-3 font-medium">{t("coachCourses.fieldLevel")}</th>
                <th className="px-4 py-3 font-medium">{t("coachCourses.colDuration")}</th>
                <th className="px-4 py-3 font-medium">{t("coachCourses.colPrice")}</th>
                <th className="px-4 py-3 font-medium">{t("coachCourses.colStatus")}</th>
                <th className="px-4 py-3 font-medium">{t("coachCourses.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coursesQuery.data?.results.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {c.title}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.category}</td>
                  <td className="px-4 py-3 text-slate-700">{levelLabel[c.level] ?? c.level}</td>
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
                      {c.is_active ? t("coachCourses.active") : t("coachCourses.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
                      >
                        {t("coachCourses.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(c)}
                        className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        {t("coachCourses.delete")}
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
        title={t("coachCourses.confirmDeleteTitle")}
        description={
          pendingDelete
            ? t("coachCourses.confirmDeleteDescription", { title: pendingDelete.title })
            : ""
        }
        confirmLabel={t("coachCourses.delete")}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.slug)}
        onCancel={() => setPendingDelete(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
