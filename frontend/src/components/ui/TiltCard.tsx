import { useRef, type ReactNode } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Maximum tilt angle in degrees. */
  max?: number;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Wraps its children with a subtle 3D tilt that follows the cursor on hover. */
export function TiltCard({ children, className = "", max = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = prefersReducedMotion();

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    node.style.transition = "none";
    node.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleLeave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.transition = "transform 400ms ease-out";
    node.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`[transform-style:preserve-3d] ${className}`}
    >
      {children}
    </div>
  );
}
