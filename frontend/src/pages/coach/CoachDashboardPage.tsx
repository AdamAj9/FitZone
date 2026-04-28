import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { coachApi } from "../../api/coach";
import { StarRating } from "../../components/StarRating";
import { formatDateTime } from "../../lib/date";

export function CoachDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["coach-dashboard"],
    queryFn: () => coachApi.dashboard(),
  });

  if (isLoading || !data) return <p className="text-slate-500">Chargement...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>

      <section className="grid gap-4 md:grid-cols-4">
        <Kpi label="Mes cours" value={data.courses_count} />
        <Kpi label="Séances à venir" value={data.upcoming_sessions_count} />
        <Kpi label="Réservations 30 jours" value={data.bookings_last_30_days} />
        <div className="rounded-2xl bg-surface p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Note moyenne
          </p>
          <div className="mt-2">
            <StarRating value={data.rating_average} size="md" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Ma prochaine séance
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
              {data.next_session.seats_taken}/{data.next_session.capacity} places
              réservées
            </p>
          </Link>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Aucune séance planifiée.{" "}
            <Link to="/coach/sessions" className="text-brand-600 hover:underline">
              Planifier une séance →
            </Link>
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickLink
          to="/coach/courses"
          title="Mes cours"
          subtitle="Créer ou modifier un cours"
        />
        <QuickLink
          to="/coach/sessions"
          title="Mes séances"
          subtitle="Planifier les créneaux"
        />
        <QuickLink
          to="/coach/bookings"
          title="Réservations"
          subtitle="Voir qui s'inscrit"
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
