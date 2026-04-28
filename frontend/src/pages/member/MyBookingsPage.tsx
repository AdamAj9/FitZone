import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { bookingsApi } from "../../api/bookings";
import { ConfirmDialog } from "../../components/ui";
import { apiErrorMessage } from "../../lib/errors";
import { formatDateTime } from "../../lib/date";
import type { Booking } from "../../types/bookings";

const statusColor: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-slate-100 text-slate-700",
  attended: "bg-brand-100 text-brand-700",
  no_show: "bg-amber-100 text-amber-800",
};

function isUpcoming(b: Booking) {
  return new Date(b.starts_at) > new Date();
}

export function MyBookingsPage() {
  const queryClient = useQueryClient();
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => bookingsApi.listMine(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingsApi.cancel(id),
    onSuccess: () => {
      toast.success("Réservation annulée");
      setPendingCancelId(null);
      void queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Annulation impossible")),
  });

  const upcoming = data?.results.filter(isUpcoming) ?? [];
  const past = data?.results.filter((b) => !isUpcoming(b)) ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Mes réservations</h1>
      </div>

      <section className="rounded-2xl bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">À venir</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-slate-500">Chargement...</p>
        ) : upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Aucune séance à venir.{" "}
            <Link to="/planning" className="text-brand-600 hover:underline">
              Voir le planning →
            </Link>
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {upcoming.map((b) => (
              <li key={b.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/courses/${b.course_slug}`}
                      className="font-medium text-slate-900 hover:text-brand-600"
                    >
                      {b.course_title}
                    </Link>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(b.starts_at)} · {b.room_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {b.channel_display}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        statusColor[b.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {b.status_display}
                    </span>
                    {b.status === "confirmed" && (
                      <button
                        type="button"
                        onClick={() => setPendingCancelId(b.id)}
                        className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="rounded-2xl bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Historique</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {past.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{b.course_title}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(b.starts_at)} · {b.room_name}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    statusColor[b.status] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {b.status_display}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialog
        open={pendingCancelId !== null}
        title="Annuler cette réservation ?"
        description="La place sera libérée pour d'autres membres."
        confirmLabel="Oui, annuler"
        onConfirm={() => {
          if (pendingCancelId) cancelMutation.mutate(pendingCancelId);
        }}
        onCancel={() => setPendingCancelId(null)}
        loading={cancelMutation.isPending}
      />
    </div>
  );
}
