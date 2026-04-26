import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { coursesApi } from "../../api/courses";

export function CoachDetailPage() {
  const { id } = useParams<{ id: string }>();
  const coachId = Number(id);

  const coachQuery = useQuery({
    queryKey: ["coach", coachId],
    queryFn: () => coursesApi.getCoach(coachId),
    enabled: Number.isFinite(coachId),
  });

  const coursesQuery = useQuery({
    queryKey: ["courses-by-coach", coachId],
    queryFn: () => coursesApi.listCourses({ coach: coachId }),
    enabled: Number.isFinite(coachId),
  });

  if (coachQuery.isLoading) return <p className="text-slate-500">Chargement...</p>;
  if (coachQuery.isError || !coachQuery.data) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
        <p className="text-slate-500">Coach introuvable.</p>
        <Link to="/coaches" className="mt-4 inline-block text-brand-600 hover:underline">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const coach = coachQuery.data;
  const profile = coach.coach_profile;
  const coachCourses = coursesQuery.data?.results ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <aside className="space-y-4">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700">
            {coach.first_name.charAt(0)}
            {coach.last_name.charAt(0)}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {coach.full_name}
          </h1>
          {profile?.specialties && (
            <p className="mt-1 text-sm text-slate-500">{profile.specialties}</p>
          )}
          {profile?.years_of_experience ? (
            <p className="mt-2 text-xs text-slate-400">
              {profile.years_of_experience} ans d'expérience
            </p>
          ) : null}
        </div>

        {profile?.bio && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Biographie</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
              {profile.bio}
            </p>
          </div>
        )}
      </aside>

      <div className="lg:col-span-2">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Cours de {coach.first_name}
        </h2>
        {coachCourses.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Aucun cours pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {coachCourses.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.slug}`}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <p className="font-medium text-slate-900">{c.title}</p>
                  <p className="text-sm text-slate-500">
                    {c.category} · {c.duration_minutes} min
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {Number(c.price_unit) > 0
                    ? `${Number(c.price_unit).toFixed(2)} €`
                    : "Inclus"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
