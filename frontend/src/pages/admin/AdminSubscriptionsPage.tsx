import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { subscriptionsApi } from "../../api/subscriptions";
import { formatDateTime } from "../../lib/date";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-800",
  expired: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
};

export function AdminSubscriptionsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: () => subscriptionsApi.listMine(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t("nav.plans")}</h1>

      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-slate-500">{t("common.loading")}</p>
        ) : (data?.results.length ?? 0) === 0 ? (
          <p className="p-8 text-center text-slate-500">{t("adminSubscriptions.empty")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("coachBookings.colMember")}</th>
                <th className="px-4 py-3 font-medium">{t("adminSubscriptions.colPlan")}</th>
                <th className="px-4 py-3 font-medium">{t("mySubscription.startDate")}</th>
                <th className="px-4 py-3 font-medium">{t("mySubscription.endDate")}</th>
                <th className="px-4 py-3 font-medium">{t("adminSubscriptions.colPricePaid")}</th>
                <th className="px-4 py-3 font-medium">{t("myPayments.colStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.results.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-slate-900">{s.user_email}</td>
                  <td className="px-4 py-3 text-slate-700">{s.plan.name}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {s.starts_at ? formatDateTime(s.starts_at) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {s.ends_at ? formatDateTime(s.ends_at) : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {Number(s.price_paid).toFixed(2)} €
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        statusColor[s.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {s.status_display}
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