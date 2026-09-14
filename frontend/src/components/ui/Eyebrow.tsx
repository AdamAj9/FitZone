import type { ReactNode } from "react";

/** Small volt label above a heading, led by a short rule. */
export function Eyebrow({
  children,
  center = false,
  className = "",
}: {
  children: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.2em] text-volt-400 ${
        center ? "justify-center" : ""
      } ${className}`}
    >
      <span aria-hidden className="h-px w-6 shrink-0 bg-volt-400" />
      {children}
    </p>
  );
}
