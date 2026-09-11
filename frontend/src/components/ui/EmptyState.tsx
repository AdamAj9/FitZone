import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Drops the card chrome. Use when the empty state already sits inside a
   *  panel or a table container, where a nested card reads as a mistake. */
  compact?: boolean;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={
        compact
          ? "px-6 py-10 text-center"
          : "rounded-2xl border border-char-800 bg-surface p-12 text-center"
      }
    >
      <div className={compact ? "text-3xl" : "text-5xl"}>{icon}</div>
      <h3
        className={`mt-3 font-display font-semibold text-slate-900 ${
          compact ? "text-base" : "text-lg"
        }`}
      >
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
