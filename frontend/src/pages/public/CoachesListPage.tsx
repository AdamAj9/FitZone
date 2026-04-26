import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { coursesApi } from "../../api/courses";

export function CoachesListPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["coaches"],
    queryFn: () => coursesApi.listCoaches(),
  });

  if (isLoading) return <p className="text-slate-500">Chargement...</p>;
  if (isError) return <p className="text-red-600">Erreur de chargement.</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Nos coachs</h1>
        <p className="mt-1 text-slate-600">
          Une équipe expérimentée pour vous accompagner.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.results.map((coach) => (
          <Link
            key={coach.id}
            to={`/coaches/${coach.id}`}
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
              {coach.first_name.charAt(0)}
              {coach.last_name.charAt(0)}
            </div>
            <h3 className="font-semibold text-slate-900">{coach.full_name}</h3>
            {coach.coach_profile?.specialties && (
              <p className="mt-1 text-sm text-slate-500">
                {coach.coach_profile.specialties}
              </p>
            )}
            {coach.coach_profile?.years_of_experience ? (
              <p className="mt-2 text-xs text-slate-400">
                {coach.coach_profile.years_of_experience} ans d'expérience
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
