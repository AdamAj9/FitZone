import type { ReactNode } from "react";

type MarqueeProps = {
  items: ReactNode[];
  /** Full loop duration in seconds — lower is faster. */
  durationS?: number;
  className?: string;
};

/** An infinitely scrolling ticker band. Pauses on hover; freezes for prefers-reduced-motion via CSS. */
export function Marquee({ items, durationS = 28, className = "" }: MarqueeProps) {
  const track = (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((item, index) => (
        <span key={index} className="flex shrink-0 items-center gap-8">
          {item}
          <span className="text-accent-400" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`group/marquee overflow-hidden ${className}`}>
      <div
        className="flex w-max animate-marquee group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${durationS}s` }}
      >
        {track}
        {track}
      </div>
    </div>
  );
}
