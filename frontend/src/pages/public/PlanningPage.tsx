import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { coursesApi } from "../../api/courses";
import { sessionsApi } from "../../api/sessions";
import { SessionCard } from "../../components/SessionCard";
import { addDays, formatDayLabel, isoDate, startOfWeek } from "../../lib/date";
import type { CourseSessionItem } from "../../types/sessions";

const WEEK_LENGTH = 7;

export function PlanningPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [categorySlug, setCategorySlug] = useState("");

  const days = useMemo(
    () => Array.from({ length: WEEK_LENGTH }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => coursesApi.listCategories(),
  });

  const sessionsQuery = useQuery({
    queryKey: [
      "sessions",
      { from: isoDate(weekStart), to: isoDate(addDays(weekStart, 6)), categorySlug },
    ],
    queryFn: () =>
      sessionsApi.listSessions({
        from: isoDate(weekStart),
        to: isoDate(addDays(weekStart, 6)),
        course__category__slug: categorySlug || undefined,
      }),
  });

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, CourseSessionItem[]>();
    for (const day of days) map.set(isoDate(day), []);
    for (const s of sessionsQuery.data?.results ?? []) {
      const key = isoDate(new Date(s.starts_at));
      map.get(key)?.push(s);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }
    return map;
  }, [days, sessionsQuery.data]);

  const today = isoDate(new Date());

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Planning</h1>
            <p className="mt-1 text-sm text-slate-500">
              Semaine du {formatDayLabel(weekStart)} au{" "}
              {formatDayLabel(addDays(weekStart, 6))}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Toutes catégories</option>
              {categoriesQuery.data?.results.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setWeekStart(addDays(weekStart, -7))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              >
                ← Semaine précédente
              </button>
              <button
                type="button"
                onClick={() => setWeekStart(startOfWeek(new Date()))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              >
                Cette semaine
              </button>
              <button
                type="button"
                onClick={() => setWeekStart(addDays(weekStart, 7))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              >
                Semaine suivante →
              </button>
            </div>
          </div>
        </div>
      </div>

      {sessionsQuery.isLoading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : sessionsQuery.isError ? (
        <p className="text-red-600">Erreur lors du chargement.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-7">
          {days.map((day) => {
            const key = isoDate(day);
            const items = sessionsByDay.get(key) ?? [];
            const isToday = key === today;
            return (
              <div
                key={key}
                className={`rounded-xl border bg-surface p-3 shadow-sm ${
                  isToday ? "border-brand-400" : "border-transparent"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <p
                    className={`text-sm font-semibold ${
                      isToday ? "text-brand-600" : "text-slate-700"
                    }`}
                  >
                    {formatDayLabel(day)}
                  </p>
                  <span className="text-xs text-slate-400">{items.length}</span>
                </div>
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400">—</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((s) => (
                      <SessionCard key={s.id} session={s} compact />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
