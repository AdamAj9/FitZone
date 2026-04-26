import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { coursesApi } from "../../api/courses";

const levelLabel: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
  all: "Tous niveaux",
};

export function CourseDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => coursesApi.getCourse(slug),
    enabled: Boolean(slug),
  });

  if (isLoading) return <p className="text-slate-500">Chargement...</p>;
  if (isError || !course) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
        <p className="text-slate-500">Cours introuvable.</p>
        <Link to="/courses" className="mt-4 inline-block text-brand-600 hover:underline">
          ← Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-50">
            {course.image && (
              <img
                src={course.image}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="p-6">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {course.category.name}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              {course.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
              <span>{levelLabel[course.level] ?? course.level}</span>
              <span>·</span>
              <span>{course.duration_minutes} min</span>
              <span>·</span>
              <span>Capacité {course.capacity}</span>
            </div>
            <p className="mt-4 whitespace-pre-line text-slate-700">
              {course.description}
            </p>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Prix unitaire</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {Number(course.price_unit) > 0
              ? `${Number(course.price_unit).toFixed(2)} €`
              : "Inclus dans l'abonnement"}
          </p>
          <button
            type="button"
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-md bg-slate-300 px-4 py-2 font-medium text-white"
            title="Disponible en Phase 6 (réservations)"
          >
            Réserver — à venir
          </button>
        </div>

        {course.coach && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Coach</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {course.coach.full_name}
            </p>
            {course.coach.coach_profile?.specialties && (
              <p className="mt-1 text-sm text-slate-600">
                {course.coach.coach_profile.specialties}
              </p>
            )}
            {course.coach.coach_profile?.bio && (
              <p className="mt-3 text-sm text-slate-600">
                {course.coach.coach_profile.bio}
              </p>
            )}
            <Link
              to={`/coaches/${course.coach.id}`}
              className="mt-3 inline-block text-sm text-brand-600 hover:underline"
            >
              Voir le profil →
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
