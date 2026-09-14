import type { CSSProperties, ReactNode } from "react";

/** Oversized background lettering, barely there — the "ELEVATE YOUR INNER
 *  POWER" layer behind the DEXAFIT hero. Purely decorative, so it is hidden
 *  from assistive tech and never catches clicks or text selection.
 *
 *  The stroke is set inline: -webkit-text-stroke has no Tailwind utility,
 *  and an arbitrary-property class is easy to get silently wrong. */
export function GhostText({
  children,
  variant = "outline",
  className = "",
}: {
  children: ReactNode;
  variant?: "outline" | "fill";
  className?: string;
}) {
  const style: CSSProperties =
    variant === "outline"
      ? { WebkitTextStroke: "1px rgba(245,245,245,0.09)", color: "transparent" }
      : { color: "rgba(245,245,245,0.04)" };

  return (
    <span
      aria-hidden
      style={style}
      className={`pointer-events-none select-none whitespace-nowrap font-display leading-none ${className}`}
    >
      {children}
    </span>
  );
}
