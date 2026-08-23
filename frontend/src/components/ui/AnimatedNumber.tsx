import { useEffect, useRef, useState } from "react";

type AnimatedNumberProps = {
  /** Raw label such as "200+", "7j/7" or "4,8". The leading number is animated, everything else is kept as-is. */
  value: string;
  className?: string;
  durationMs?: number;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const NUMBER_PATTERN = /(\d+)/;

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** Counts a number up from 0 to its target once it enters the viewport. */
export function AnimatedNumber({
  value,
  className = "",
  durationMs = 1400,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() =>
    prefersReducedMotion() ? value : value.replace(NUMBER_PATTERN, "0"),
  );
  const match = value.match(NUMBER_PATTERN);

  useEffect(() => {
    if (prefersReducedMotion() || !match) return;
    const node = ref.current;
    if (!node) return;

    const target = Number(match[1]);
    const [prefix, suffix] = [
      value.slice(0, match.index),
      value.slice((match.index ?? 0) + match[1].length),
    ];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1);
          const current = Math.round(target * easeOutExpo(progress));
          setDisplay(`${prefix}${current}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
