import { Link } from "react-router-dom";

import type { CourseListItem } from "../types/courses";

const levelLabel: Record<CourseListItem["level"], string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
  all: "Tous niveaux",
};

const levelColor: Record<CourseListItem["level"], string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-amber-100 text-amber-800",
  advanced: "bg-red-100 text-red-800",
  all: "bg-slate-100 text-slate-800",
};

export function CourseCard({ course }: { course: CourseListItem }) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-50">
        {course.image && (
          <img
            src={course.image}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-brand-600">{course.category}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${levelColor[course.level]}`}
          >
            {levelLabel[course.level]}
          </span>
        </div>
        <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-brand-600">
          {course.title}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {course.coach_name ?? "Sans coach attitré"}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="text-slate-600">{course.duration_minutes} min</span>
          <span className="font-semibold text-slate-900">
            {Number(course.price_unit) > 0
              ? `${Number(course.price_unit).toFixed(2)} €`
              : "Inclus"}
          </span>
        </div>
      </div>
    </Link>
  );
}
