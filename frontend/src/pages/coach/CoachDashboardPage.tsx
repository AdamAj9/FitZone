import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { coachApi } from "../../api/coach";
import { StarRating } from "../../components/StarRating";
import { formatDateTime } from "../../lib/date";

export function CoachDashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["coach-dashboard"],
    queryFn: () => coachApi.dashboard(),
  });

  if (isLoading || !data) return <p className="text-slate-500">{t("common.loading")}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t("coachDashboard.title")}</h1>

      <section className="grid gap-4 md:grid-cols-4">
        <Kpi label={t("coachDashboard.myCourses")} value={data.courses_count} />
        <Kpi label={t("coachDashboard.upcomingSessions")} value={data.upcoming_sessions_count} />
        <Kpi label={t("coachDashboard.bookings30Days")} value={data.bookings_last_30_days} />
        <div className="rounded-2xl bg-surface p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t("coachDashboard.averageRating")}
          </p>
          <div className="mt-2">
            <StarRating value={data.rating_average} size="md" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {t("coachDashboard.nextSession")}
        </h2>
        {data.next_session ? (
          <Link
            to="/coach/sessions"
            className="mt-3 block rounded-lg border border-slate-200 p-4 hover:border-brand-300"
          >
            <p className="font-medium text-slate-900">
              {data.next_session.course_title}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {formatDateTime(data.next_session.starts_at)} ·{" "}
              {data.next_session.room_name}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {t("coachDashboard.seatsBooked", {
                taken: data.next_session.seats_taken,
                capacity: data.next_session.capacity,
              })}
            </p>
          </Link>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            {t("coachDashboard.noSessionPlanned")}{" "}
            <Link to="/coach/sessions" className="text-brand-600 hover:underline">
              {t("coachDashboard.planSession")} →
            </Link>
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickLink
          to="/coach/courses"
          title={t("coachDashboard.myCourses")}
          subtitle={t("coachDashboard.createOrEditCourse")}
        />
        <QuickLink
          to="/coach/sessions"
          title={t("coachDashboard.mySessions")}
          subtitle={t("coachDashboard.planSlots")}
        />
        <QuickLink
          to="/coach/bookings"
          title={t("coachDashboard.bookings")}
          subtitle={t("coachDashboard.seeWhoBooked")}
        />
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function QuickLink({
  to,
  title,
  subtitle,
}: {
  to: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl bg-surface p-6 shadow-sm transition hover:shadow-md"
    >
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </Link>
  );
}
