import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { coursesApi } from "../../api/courses";
import { CourseCard } from "../../components/CourseCard";
import { EmptyState, SkeletonCard } from "../../components/ui";
import type { CourseLevel } from "../../types/courses";

export function CoursesListPage() {
  const { t } = useTranslation();
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
        <h1 className="text-3xl font-bold text-slate-900">{t("courses.title")}</h1>
        <p className="mt-1 text-slate-600">
          {t("courses.subtitle")}
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            type="search"
            placeholder={t("courses.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="">{t("courses.allCategories")}</option>
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
            <option value="">{t("common.levels.all")}</option>
            <option value="beginner">{t("common.levels.beginner")}</option>
            <option value="intermediate">{t("common.levels.intermediate")}</option>
            <option value="advanced">{t("common.levels.advanced")}</option>
            <option value="all">{t("common.levels.all")}</option>
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
        <p className="text-red-600">{t("courses.loadError")}</p>
      ) : coursesQuery.data && coursesQuery.data.results.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={t("courses.emptyTitle")}
          description={t("courses.emptyDescription")}
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
