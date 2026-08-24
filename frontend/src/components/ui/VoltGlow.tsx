type VoltGlowProps = {
  className?: string;
  /** Swaps which corner gets green vs orange — lets the green→orange energy
   * shift progressively as sections scroll from hero down to the final CTA. */
  flip?: boolean;
  /** Lower intensity for subtle full-section washes vs. a punchy hero backdrop. */
  subtle?: boolean;
};

/** Decorative abstract volt-green / ember-orange glow blobs. Purely
 * decorative — pointer-events-none, never affects layout or readability. */
export function VoltGlow({ className = "", flip = false, subtle = false }: VoltGlowProps) {
  const opacity = subtle ? "opacity-60" : "";
  const first = flip ? "bg-ember-500" : "bg-volt-400";
  const second = flip ? "bg-volt-400" : "bg-ember-500";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${opacity} ${className}`}
      aria-hidden
    >
      <div
        className={`absolute -left-32 top-0 h-[26rem] w-[26rem] rounded-full ${first}/20 blur-[110px]`}
      />
      <div
        className={`absolute -right-24 bottom-0 h-[30rem] w-[30rem] rounded-full ${second}/20 blur-[120px]`}
      />
      <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-volt-300/10 blur-[90px]" />
    </div>
  );
}
