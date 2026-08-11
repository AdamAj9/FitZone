import { useQuery } from "@tanstack/react-query";

import { paymentsApi } from "../../api/payments";
import { formatDateTime } from "../../lib/date";

const statusColor: Record<string, string> = {
  succeeded: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-slate-100 text-slate-700",
};

export function AdminPaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => paymentsApi.listMine(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Paiements</h1>

      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-slate-500">Chargement...</p>
        ) : (data?.results.length ?? 0) === 0 ? (
          <p className="p-8 text-center text-slate-500">Aucun paiement.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Détail</th>
                <th className="px-4 py-3 font-medium">Montant</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.results.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-slate-900">
                    {formatDateTime(p.created_at)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {p.user_email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{p.kind_display}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {p.subscription_plan ?? p.course_title ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {Number(p.amount).toFixed(2)} {p.currency}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        statusColor[p.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {p.status_display}
                    </span>
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