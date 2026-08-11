import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { coachApi } from "../../api/coach";
import { sessionsApi } from "../../api/sessions";
import { ConfirmDialog } from "../../components/ui";
import { apiErrorMessage } from "../../lib/errors";
import { useAuthStore } from "../../store/auth";
import { formatDateTime } from "../../lib/date";
import type { CoachSessionWritePayload } from "../../types/coach";

function addDaysToDatetimeLocal(value: string, days: number): string {
  const d = new Date(value);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

const emptyForm: CoachSessionWritePayload = {
  course: 0,
  room: 0,
  starts_at: "",
  ends_at: "",
};

export function CoachSessionsPage() {
  const { t } = useTranslation();
  const sessionStatusLabel: Record<string, string> = {
    scheduled: t("coachSessions.statusScheduled"),
    cancelled: t("coachSessions.statusCancelled"),
    completed: t("coachSessions.statusCompleted"),
  };
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CoachSessionWritePayload>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [repeatWeeks, setRepeatWeeks] = useState(1);

  const coursesQuery = useQuery({
    queryKey: ["coach-courses", user?.id],
    queryFn: () => coachApi.myCourses(user!.id),
    enabled: Boolean(user?.id),
  });
  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: () => sessionsApi.listRooms(),
  });
  const sessionsQuery = useQuery({
    queryKey: ["coach-sessions", user?.id],
    queryFn: () => coachApi.mySessions(user!.id),
    enabled: Boolean(user?.id),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["coach-sessions"] });
    void queryClient.invalidateQueries({ queryKey: ["coach-dashboard"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CoachSessionWritePayload) =>
      coachApi.createSession(payload),
    onSuccess: () => {
      toast.success(t("coachSessions.created"));
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      invalidate();
    },
    onError: (e) => toast.error(apiErrorMessage(e, t("coachSessions.createError"))),
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
      toast.success(t("coachSessions.updated"));
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      invalidate();
    },
    onError: (e) => toast.error(apiErrorMessage(e, t("coachCourses.updateError"))),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => coachApi.deleteSession(id),
    onSuccess: () => {
      toast.success(t("coachSessions.deleted"));
      setPendingDelete(null);
      invalidate();
    },
    onError: (e) => toast.error(apiErrorMessage(e, t("coachCourses.deleteError"))),
  });

 const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
      return;
    }
    if (repeatWeeks > 1) {
      void (async () => {
        try {
          for (let i = 0; i < repeatWeeks; i++) {
            await coachApi.createSession({
              ...form,
              starts_at: addDaysToDatetimeLocal(form.starts_at, i * 7),
              ends_at: addDaysToDatetimeLocal(form.ends_at, i * 7),
            });
          }
          toast.success(t("coachSessions.multipleCreated", { count: repeatWeeks }));
          setShowForm(false);
          setForm(emptyForm);
          setRepeatWeeks(1);
          invalidate();
        } catch (err) {
          toast.error(apiErrorMessage(err, t("coachSessions.createError")));
        }
      })();
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
        <h1 className="text-2xl font-bold text-slate-900">{t("coachDashboard.mySessions")}</h1>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + {t("coachSessions.newSession")}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl bg-surface p-6 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">{t("coachSessions.fieldCourse")}</label>
              <select
                value={form.course}
                onChange={(e) =>
                  setForm({ ...form, course: Number(e.target.value) })
                }
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">— {t("coachCourses.choose")} —</option>
                {coursesQuery.data?.results.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">{t("coachSessions.fieldRoom")}</label>
              <select
                value={form.room}
                onChange={(e) =>
                  setForm({ ...form, room: Number(e.target.value) })
                }
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">— {t("coachCourses.choose")} —</option>
                {roomsQuery.data?.results.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.building_display})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">{t("coachSessions.fieldStart")}</label>
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
              <label className="text-sm font-medium text-slate-700">{t("coachSessions.fieldEnd")}</label>
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
                {t("coachSessions.fieldCapacity")}
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
                placeholder={t("coachSessions.capacityPlaceholder")}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            {!editingId && (
              <div>
                <label className="text-sm font-medium text-slate-700">
                  {t("coachSessions.repeatWeekly")}
                </label>
                <select
                  value={repeatWeeks}
                  onChange={(e) => setRepeatWeeks(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value={1}>{t("coachSessions.onceOnly")}</option>
                  {[4, 8, 12].map((w) => (
                    <option key={w} value={w}>
                      {t("coachSessions.weeksCount", { count: w })}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {editingId ? t("profile.save") : t("coachSessions.schedule")}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
        {sessionsQuery.isLoading ? (
          <p className="p-8 text-center text-slate-500">{t("common.loading")}</p>
        ) : (sessionsQuery.data?.results.length ?? 0) === 0 ? (
          <p className="p-8 text-center text-slate-500">
            {t("coachSessions.empty")}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("myPayments.colDate")}</th>
                <th className="px-4 py-3 font-medium">{t("coachSessions.fieldCourse")}</th>
                <th className="px-4 py-3 font-medium">{t("coachSessions.fieldRoom")}</th>
                <th className="px-4 py-3 font-medium">{t("coachSessions.colSeats")}</th>
                <th className="px-4 py-3 font-medium">{t("coachCourses.colStatus")}</th>
                <th className="px-4 py-3 font-medium">{t("coachCourses.colActions")}</th>
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
                      {sessionStatusLabel[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setPendingDelete(s.id)}
                      className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      {t("coachCourses.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("coachSessions.confirmDeleteTitle")}
        description={t("coachSessions.confirmDeleteDescription")}
        confirmLabel={t("coachCourses.delete")}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
