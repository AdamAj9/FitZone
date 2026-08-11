import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DisplayProps {
  value: number | null;
  count?: number;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
};

/** Read-only star display. value=null means "no ratings yet". */
export function StarRating({ value, count, size = "md" }: DisplayProps) {
  const { t } = useTranslation();
  if (value == null) {
    return (
      <span className={`text-slate-400 ${sizeMap[size]}`}>
        ☆☆☆☆☆ <span className="text-xs">({t("starRating.noReviews")})</span>
      </span>
    );
  }
  const full = Math.round(value);
  return (
    <span className={sizeMap[size]}>
      <span className="text-amber-500">{"★".repeat(full)}</span>
      <span className="text-slate-300">{"★".repeat(5 - full)}</span>
      <span className="ml-2 text-sm font-medium text-slate-700">
        {value.toFixed(1)}
      </span>
      {count != null && (
        <span className="ml-1 text-xs text-slate-500">({count})</span>
      )}
    </span>
  );
}

interface InputProps {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "md" | "lg";
}

/** Interactive star picker. */
export function StarRatingInput({ value, onChange, size = "lg" }: InputProps) {
  const { t } = useTranslation();
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  return (
    <div className={`flex items-center gap-1 ${sizeMap[size]}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(s)}
          className={`leading-none transition ${
            s <= display ? "text-amber-500" : "text-slate-300"
          }`}
          aria-label={t("starRating.starsCount", { count: s })}
        >
          ★
        </button>
      ))}
    </div>
  );
}
