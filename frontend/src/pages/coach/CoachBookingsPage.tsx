import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { coachApi } from "../../api/coach";
import { useAuthStore } from "../../store/auth";
import { formatDateTime } from "../../lib/date";

export function CoachBookingsPage() {
  const user = useAuthStore((s) => s.user);
  const [sessionId, setSessionId] = useState<number | "">("");
  const sessionsQuery = useQuery({
    queryKey: ["coach-sessions", user?.id],
    queryFn: () => coachApi.mySessions(user!.id),
    enabled: Boolean(user?.id),
  });
  const bookingsQuery = useQuery({
    queryKey: ["coach-bookings", sessionId],
    queryFn: () =>
      coachApi.bookings(typeof sessionId === "number" ? sessionId : undefined),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Réservations</h1>
        <select
          value={sessionId}
          onChange={(e) =>
            setSessionId(e.target.value ? Number(e.target.value) : "")
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Toutes mes séances</option>
          {sessionsQuery.data?.results.map((s) => (
            <option key={s.id} value={s.id}>
              {formatDateTime(s.starts_at)} — {s.course_title}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
        {bookingsQuery.isLoading ? (
          <p className="p-8 text-center text-slate-500">Chargement...</p>
        ) : (bookingsQuery.data?.length ?? 0) === 0 ? (
          <p className="p-8 text-center text-slate-500">
            Aucune réservation.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Membre</th>
                <th className="px-4 py-3 font-medium">Cours</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Salle</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Réservé le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookingsQuery.data?.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{b.user_name}</p>
                    <p className="text-xs text-slate-500">{b.user_email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{b.course_title}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDateTime(b.starts_at)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{b.room_name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        b.channel === "subscription"
                          ? "bg-brand-100 text-brand-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {b.channel_display}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {formatDateTime(b.created_at)}
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
