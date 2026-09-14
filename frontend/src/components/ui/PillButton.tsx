import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type Variant = "primary" | "ghost";
type Size = "sm" | "md" | "lg";

interface PillStyle {
  variant?: Variant;
  size?: Size;
  /** Circular arrow badge on the right. Defaults to on for primary only. */
  arrow?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

const SIZE: Record<Size, { root: string; pad: string; padBare: string; dot: string }> = {
  sm: { root: "h-10 text-[0.8rem]", pad: "pl-4 pr-1", padBare: "px-4", dot: "h-8 w-8" },
  md: { root: "h-12 text-sm", pad: "pl-6 pr-1.5", padBare: "px-6", dot: "h-9 w-9" },
  lg: { root: "h-14 text-base", pad: "pl-7 pr-2", padBare: "px-7", dot: "h-10 w-10" },
};

const VARIANT: Record<Variant, { root: string; dot: string }> = {
  primary: {
    root: "bg-volt-400 text-char-950 shadow-volt-glow hover:bg-volt-300",
    dot: "bg-char-950 text-volt-400",
  },
  ghost: {
    root: "border border-white/20 bg-white/5 text-white backdrop-blur hover:border-volt-400/60 hover:text-volt-400",
    dot: "bg-white/10 text-current",
  },
};

function pill({
  variant = "primary",
  size = "md",
  arrow,
  fullWidth,
  className = "",
}: Omit<PillStyle, "children">) {
  const withArrow = arrow ?? variant === "primary";
  const s = SIZE[size];
  const v = VARIANT[variant];
  return {
    withArrow,
    root: [
      "group inline-flex items-center gap-3 rounded-full font-display tracking-wide transition",
      "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-char-950",
      s.root,
      withArrow ? s.pad : s.padBare,
      v.root,
      fullWidth ? "w-full" : "",
      className,
    ].join(" "),
    dot: `ml-auto flex shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:-rotate-45 ${s.dot} ${v.dot}`,
  };
}

function Inner({
  children,
  withArrow,
  dot,
  fullWidth,
}: {
  children: ReactNode;
  withArrow: boolean;
  dot: string;
  fullWidth?: boolean;
}) {
  return (
    <>
      <span className={fullWidth ? "flex-1 text-center" : ""}>{children}</span>
      {withArrow && (
        <span aria-hidden className={dot}>
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path
              d="M4 10h11m0 0-4.5-4.5M15 10l-4.5 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </>
  );
}

/** The DEXAFIT-style call to action: a pill, with the arrow in its own
 *  circle that turns on hover. Primary actions only — a page should rarely
 *  carry more than one or two. */
export function PillLink({
  variant,
  size,
  arrow,
  fullWidth,
  className,
  children,
  ...rest
}: PillStyle & Omit<LinkProps, "className" | "children">) {
  const p = pill({ variant, size, arrow, fullWidth, className });
  return (
    <Link {...rest} className={p.root}>
      <Inner withArrow={p.withArrow} dot={p.dot} fullWidth={fullWidth}>
        {children}
      </Inner>
    </Link>
  );
}

export function PillButton({
  variant,
  size,
  arrow,
  fullWidth,
  className,
  children,
  type = "button",
  ...rest
}: PillStyle & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  const p = pill({ variant, size, arrow, fullWidth, className });
  return (
    <button {...rest} type={type} className={p.root}>
      <Inner withArrow={p.withArrow} dot={p.dot} fullWidth={fullWidth}>
        {children}
      </Inner>
    </button>
  );
}
