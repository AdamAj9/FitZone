import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { adminApi } from "../../api/admin";

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.dashboard(),
  });

  if (isLoading || !data) return <p className="text-slate-500">{t("common.loading")}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t("coachDashboard.title")}</h1>

      <section className="grid gap-4 md:grid-cols-3">
        <Kpi label={t("adminDashboard.members")} value={data.users.members} />
        <Kpi label={t("adminDashboard.coaches")} value={data.users.coaches} />
        <Kpi label={t("adminDashboard.totalUsers")} value={data.users.total} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Kpi label={t("adminDashboard.activeSubscriptions")} value={data.active_subscriptions} />
        <Kpi
          label={t("adminDashboard.revenue30Days")}
          value={`${Number(data.revenue_last_30_days).toFixed(2)} €`}
          smallValue
        />
        <Kpi label={t("coachDashboard.bookings30Days")} value={data.bookings_last_30_days} />
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {t("adminDashboard.topActions")}
        </h2>
        {data.top_actions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">{t("adminDashboard.noActivity")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {data.top_actions.map((a) => (
              <li
                key={a.action}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="font-mono text-slate-600">{a.action}</span>
                <span className="font-semibold text-slate-900">{a.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  smallValue = false,
}: {
  label: string;
  value: string | number;
  smallValue?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 font-bold text-slate-900 ${
          smallValue ? "text-xl" : "text-3xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
