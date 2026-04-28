import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { coursesApi } from "../../api/courses";
import { CourseCard } from "../../components/CourseCard";
import { EmptyState, SkeletonCard } from "../../components/ui";
import type { CourseLevel } from "../../types/courses";

export function CoursesListPage() {
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [level, setLevel] = useState<CourseLevel | "">("");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => coursesApi.listCategories(),
  });

  const coursesQuery = useQuery({
    queryKey: ["courses", { search, categorySlug, level }],
    queryFn: () =>
      coursesApi.listCourses({
        search: search || undefined,
        category__slug: categorySlug || undefined,
        level: level || undefined,
      }),
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Nos cours</h1>
        <p className="mt-1 text-slate-600">
          Trouvez le cours qui correspond à votre niveau et vos envies.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            type="search"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">Toutes catégories</option>
            {categoriesQuery.data?.results.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name} ({c.course_count})
              </option>
            ))}
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as CourseLevel | "")}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">Tous niveaux</option>
            <option value="beginner">Débutant</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="advanced">Avancé</option>
            <option value="all">Tous niveaux</option>
          </select>
        </div>
      </div>

      {coursesQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : coursesQuery.isError ? (
        <p className="text-red-600">Erreur lors du chargement.</p>
      ) : coursesQuery.data && coursesQuery.data.results.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Aucun cours ne correspond"
          description="Essayez de modifier ou retirer un filtre."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coursesQuery.data?.results.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
