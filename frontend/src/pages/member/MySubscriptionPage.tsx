import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { subscriptionsApi } from "../../api/subscriptions";
import { ConfirmDialog } from "../../components/ui";
import { formatDateTime } from "../../lib/date";
import { apiErrorMessage } from "../../lib/errors";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  expired: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
};

export function MySubscriptionPage() {
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const currentQuery = useQuery({
    queryKey: ["subscription-current"],
    queryFn: () => subscriptionsApi.current(),
  });

  const historyQuery = useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: () => subscriptionsApi.listMine(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => subscriptionsApi.cancel(id),
    onSuccess: () => {
      toast.success("Abonnement annulé");
      setConfirmCancel(false);
      void queryClient.invalidateQueries({ queryKey: ["subscription-current"] });
      void queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Annulation impossible")),
  });

  const current = currentQuery.data?.subscription ?? null;
  const history = historyQuery.data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Mon abonnement</h1>
      </div>

      {currentQuery.isLoading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : current ? (
        <div className="rounded-2xl border-2 border-brand-200 bg-surface p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
                {current.plan.tier_display}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {current.plan.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {Number(current.price_paid).toFixed(2)} € payés
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusColor[current.status] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {current.status_display}
            </span>
          </div>

          <div className="mt-6 grid gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-slate-500">Début</p>
              <p className="font-medium text-slate-900">
                {current.starts_at ? formatDateTime(current.starts_at) : "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Fin</p>
              <p className="font-medium text-slate-900">
                {current.ends_at ? formatDateTime(current.ends_at) : "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Jours restants</p>
              <p className="font-medium text-slate-900">
                {current.days_remaining ?? "—"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmCancel(true)}
            className="mt-6 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Annuler l'abonnement
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface p-8 text-center shadow-sm">
          <p className="text-slate-600">Vous n'avez aucun abonnement actif.</p>
          <Link
            to="/plans"
            className="mt-4 inline-block rounded-md bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700"
          >
            Voir les formules
          </Link>
        </div>
      )}

      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Historique</h2>
        {historyQuery.isLoading ? (
          <p className="mt-3 text-sm text-slate-500">Chargement...</p>
        ) : history.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Aucun historique.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {history.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{s.plan.name}</p>
                  <p className="text-xs text-slate-500">
                    {s.starts_at ? formatDateTime(s.starts_at) : "—"}
                    {s.ends_at ? ` → ${formatDateTime(s.ends_at)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">
                    {Number(s.price_paid).toFixed(2)} €
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      statusColor[s.status] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {s.status_display}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Annuler l'abonnement ?"
        description="Vous perdrez immédiatement l'accès aux services Premium. Cette action est irréversible."
        confirmLabel="Oui, annuler"
        onConfirm={() => current && cancelMutation.mutate(current.id)}
        onCancel={() => setConfirmCancel(false)}
        loading={cancelMutation.isPending}
      />
    </div>
  );
}
