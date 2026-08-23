import { useEffect, useState } from "react";

type Word = {
  text: string;
  className?: string;
};

type AnimatedWordsProps = {
  /** Words rendered in order, each with its own optional className (e.g. for a gradient run). */
  words: Word[];
  /** Delay in ms before the first word starts. */
  startDelay?: number;
  /** Gap in ms between each word. */
  stagger?: number;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Reveals a headline word by word (fade + slide up) shortly after mount. */
export function AnimatedWords({ words, startDelay = 100, stagger = 90 }: AnimatedWordsProps) {
  const [visible, setVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <span className="inline-flex flex-wrap gap-x-[0.28em]">
      {words.map((word, index) => (
        <span key={`${word.text}-${index}`} className="inline-block overflow-hidden pb-1 align-bottom">
          <span
            className={`inline-block transition-all duration-700 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            } ${word.className ?? ""}`}
            style={{ transitionDelay: `${startDelay + index * stagger}ms` }}
          >
            {word.text}
          </span>
        </span>
      ))}
    </span>
  );
}
