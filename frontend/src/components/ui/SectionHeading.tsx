import { Eyebrow } from "./Eyebrow";
import { GradientTail } from "./GradientTail";
import { PillLink } from "./PillButton";
import { Reveal } from "./Reveal";

/** The heading every home-page section shares: eyebrow, condensed display
 *  title with its last word in the gradient, optional subtitle, and an
 *  optional "see all" pill pushed to the right.
 *
 *  Before this, each section rolled its own markup at text-4xl with a small
 *  bold label — a size and weight that read as timid next to the new hero. */
export function SectionHeading({
  label,
  title,
  subtitle,
  align = "left",
  action,
  className = "",
}: {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  action?: { to: string; label: string };
  className?: string;
}) {
  const centered = align === "center";
  return (
    <Reveal
      className={`${
        centered ? "text-center" : "flex flex-wrap items-end justify-between gap-6"
      } ${className}`}
    >
      <div className={centered ? "" : "max-w-3xl"}>
        {label && <Eyebrow center={centered}>{label}</Eyebrow>}
        <h2
          className={`mt-3 font-display text-4xl leading-[0.95] text-white md:text-5xl lg:text-6xl ${
            centered ? "mx-auto max-w-3xl" : ""
          }`}
        >
          <GradientTail text={title} />
        </h2>
        {subtitle && (
          <p className={`mt-4 text-char-300 ${centered ? "mx-auto max-w-xl" : "max-w-xl"}`}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <PillLink to={action.to} variant="ghost" size="sm" className="shrink-0">
          {action.label}
        </PillLink>
      )}
    </Reveal>
  );
}
