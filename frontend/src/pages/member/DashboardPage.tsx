import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { meApi } from "../../api/me";
import { subscriptionsApi } from "../../api/subscriptions";
import { SessionCard } from "../../components/SessionCard";
import { useMe } from "../../hooks/useAuth";
import { formatDateTime } from "../../lib/date";

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: user, isLoading: userLoading } = useMe();
  const subQuery = useQuery({
    queryKey: ["subscription-current"],
    queryFn: () => subscriptionsApi.current(),
    enabled: Boolean(user),
  });
  const statsQuery = useQuery({
    queryKey: ["my-stats"],
    queryFn: () => meApi.stats(),
    enabled: Boolean(user),
  });
  const recoQuery = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => meApi.recommendations(),
    enabled: Boolean(user),
  });

  if (userLoading || !user) {
    return <p className="text-slate-500">{t("common.loading")}</p>;
  }

  const sub = subQuery.data?.subscription ?? null;
  const stats = statsQuery.data;
  const reco = recoQuery.data;
  const questionnaireDone = user.member_profile?.questionnaire_completed;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-surface p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          {t("memberDashboard.greeting", { name: user.first_name || user.email })} 👋
        </h1>
        <p className="mt-2 text-slate-600">
          {t("memberDashboard.welcome")}
        </p>
      </div>

      {!questionnaireDone && (
        <Link
          to="/questionnaire"
          className="block rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 p-5 transition hover:bg-brand-100"
        >
          <p className="text-sm font-semibold text-brand-700">
            {t("memberDashboard.personalizeTitle")}
          </p>
          <p className="mt-1 text-sm text-brand-600">
            {t("memberDashboard.personalizeText")} →
          </p>
        </Link>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label={t("memberDashboard.statAttended")} value={stats?.total_attended ?? 0} />
        <StatCard label={t("memberDashboard.statLast30Days")} value={stats?.last_30_days ?? 0} />
        <StatCard label={t("memberDashboard.statUpcoming")} value={stats?.upcoming_count ?? 0} />
        <StatCard
          label={t("memberDashboard.statFavoriteCategory")}
          value={stats?.favorite_category ?? "—"}
          smallValue
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-2xl bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              {t("memberDashboard.nextSession")}
            </h2>
            {stats?.next_booking ? (
              <Link
                to={`/courses/${stats.next_booking.course_slug}`}
                className="mt-3 block rounded-lg border border-slate-200 p-4 hover:border-brand-300"
              >
                <p className="font-medium text-slate-900">
                  {stats.next_booking.course_title}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDateTime(stats.next_booking.starts_at)} ·{" "}
                  {stats.next_booking.room_name}
                </p>
              </Link>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                {t("memberDashboard.noBookedSession")}{" "}
                <Link to="/planning" className="text-brand-600 hover:underline">
                  {t("memberDashboard.viewPlanning")} →
                </Link>
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              {t("memberDashboard.recommendedForYou")}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {reco?.based_on.history_categories.length
                ? t("memberDashboard.basedOnHistory", { categories: reco.based_on.history_categories.join(", ") })
                : reco?.based_on.questionnaire_categories.length
                  ? t("memberDashboard.basedOnPreferences", { categories: reco.based_on.questionnaire_categories.join(", ") })
                  : t("memberDashboard.popularComingSoon")}
            </p>
            {recoQuery.isLoading ? (
              <p className="mt-3 text-sm text-slate-500">{t("common.loading")}</p>
            ) : (reco?.results.length ?? 0) === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                {t("memberDashboard.noRecommendations")}
              </p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {reco?.results.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <Link
            to="/my-subscription"
            className="block rounded-2xl bg-surface p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {t("memberDashboard.subscription")}
            </p>
            {sub ? (
              <>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {sub.plan.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {t("memberDashboard.daysLeft", { count: sub.days_remaining })}
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {t("memberDashboard.noSubscription")}
                </p>
                <p className="mt-1 text-sm text-brand-600">{t("home.subscribe")} →</p>
              </>
            )}
          </Link>

          <Link
            to="/my-bookings"
            className="block rounded-2xl bg-surface p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {t("memberDashboard.bookings")}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {t("memberDashboard.upcomingCount", { count: stats?.upcoming_count ?? 0 })}
            </p>
          </Link>

          <Link
            to="/profile"
            className="block rounded-2xl bg-surface p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {t("memberDashboard.profile")}
            </p>
            <p className="mt-2 text-sm text-slate-700">{user.email}</p>
          </Link>

          <Link
            to="/my-payments"
            className="block rounded-2xl bg-surface p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {t("memberDashboard.payments")}
            </p>
            <p className="mt-2 text-sm text-slate-700">{t("memberDashboard.stripeHistory")}</p>
          </Link>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
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
          smallValue ? "text-lg" : "text-3xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
