import type { ReactNode } from "react";

import { Eyebrow } from "./Eyebrow";
import { GhostText } from "./GhostText";
import { GradientTail } from "./GradientTail";
import { Reveal } from "./Reveal";
import { VoltGlow } from "./VoltGlow";

/** The banner at the top of a public page.
 *
 *  Eyebrow, condensed display title with its last word in the gradient,
 *  subtitle — with the eyebrow word repeated as giant ghost lettering behind
 *  it and a glowing rule along the bottom edge, both lifted from the DEXAFIT
 *  reference. */
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
    <Reveal className="relative isolate overflow-hidden rounded-3xl border border-char-800 bg-char-900/60 p-6 backdrop-blur-xl sm:p-10">
      <VoltGlow subtle />
      {label && (
        // Faded out towards the top so the lettering sits in the empty band
        // under the content instead of running through the subtitle.
        <div
          aria-hidden
          className={`pointer-events-none absolute -bottom-10 ${
            centered ? "inset-x-0 flex justify-center" : "-right-6"
          }`}
          style={{
            maskImage: "linear-gradient(to top, black 25%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to top, black 25%, transparent 80%)",
          }}
        >
          <GhostText className="text-[7rem] sm:text-[10rem] lg:text-[13rem]">
            {label}
          </GhostText>
        </div>
      )}
      <div className={`relative ${centered ? "text-center" : ""}`}>
        {label && <Eyebrow center={centered}>{label}</Eyebrow>}
        <h1 className="mt-3 font-display text-4xl leading-[0.95] text-slate-900 md:text-6xl">
          <GradientTail text={title} />
        </h1>
        {subtitle && (
          <p className={`mt-4 text-char-300 ${centered ? "mx-auto max-w-xl" : "max-w-xl"}`}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-volt-400/70 to-transparent"
      />
    </Reveal>
  );
}
