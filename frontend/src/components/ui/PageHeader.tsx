import type { ReactNode } from "react";

import { GradientTail } from "./GradientTail";
import { Reveal } from "./Reveal";
import { VoltGlow } from "./VoltGlow";

/** The banner at the top of a public list page.
 *
 *  These were flat panels carrying a title and little else, which read as
 *  empty next to the home page. This gives them the same three-part shape
 *  the home page sections use — eyebrow, display title with its last word
 *  in the gradient, subtitle — plus the glow, so the pages look like they
 *  belong to the same site.
 *
 *  One gradient per page keeps it an accent rather than a default. */
export function PageHeader({
  label,
  title,
  subtitle,
  align = "left",
  children,
}: {
  label?: string;
  title: string;
  subtitle?: ReactNode;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <Reveal className="relative isolate overflow-hidden rounded-2xl border border-char-800 bg-char-900/60 p-6 backdrop-blur-xl sm:p-8">
      <VoltGlow subtle />
      <div className={`relative ${centered ? "text-center" : ""}`}>
        {label && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-400">
            {label}
          </p>
        )}
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
          <GradientTail text={title} />
        </h1>
        {subtitle && (
          <p
            className={`mt-2 text-slate-400 ${centered ? "mx-auto max-w-xl" : "max-w-xl"}`}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </Reveal>
  );
}
