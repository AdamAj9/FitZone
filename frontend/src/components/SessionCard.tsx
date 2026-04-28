import { Link } from "react-router-dom";

import { formatTime } from "../lib/date";
import type { CourseSessionItem } from "../types/sessions";

interface Props {
  session: CourseSessionItem;
  compact?: boolean;
}

export function SessionCard({ session, compact = false }: Props) {
  const ratio =
    session.capacity > 0 ? session.seats_taken / session.capacity : 0;
  const fullnessColor =
    ratio >= 1
      ? "bg-red-100 text-red-700"
      : ratio >= 0.8
        ? "bg-amber-100 text-amber-700"
        : "bg-green-100 text-green-700";

  return (
    <Link
      to={`/courses/${session.course_slug}`}
      className="block rounded-lg border border-slate-200 bg-surface p-3 transition hover:border-brand-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-xs font-semibold text-brand-600">
          {formatTime(session.starts_at)} – {formatTime(session.ends_at)}
        </p>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${fullnessColor}`}
          title={`${session.seats_taken}/${session.capacity} places`}
        >
          {session.seats_available}/{session.capacity}
        </span>
      </div>
      <p className="mt-1 truncate font-semibold text-slate-900">
        {session.course_title}
      </p>
      {!compact && (
        <p className="mt-1 truncate text-xs text-slate-500">
          {session.coach_name ?? "—"} · {session.room_name}
        </p>
      )}
    </Link>
  );
}
