import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { VoltGlow } from "../../components/ui/VoltGlow";

const AUTH_IMAGE = "/images/hero/hero-volt-ember.webp";

/** Shared frame for the login and register screens.
 *
 *  Both used to be a narrow card floating in a large dark void, which
 *  carried none of the brand a visitor has just come from. This pairs the
 *  form with the hero photo and repeats the home page promise, so the step
 *  after "Commencer gratuitement" looks like it belongs to the same site.
 *
 *  The panel is decorative and hidden below lg: on a phone it would push
 *  the form off screen, and the copy it shows is a repeat, not new
 *  information. */
export function AuthShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-char-800 bg-char-900/60 backdrop-blur-xl lg:grid lg:grid-cols-[1fr_1.05fr]">
      <div className="p-8 sm:p-10">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          {title}
        </h1>
        {children}
        <div className="mt-6 border-t border-char-800 pt-5 text-center text-sm text-slate-500">
          {footer}
        </div>
      </div>

      <aside className="relative hidden overflow-hidden lg:block" aria-hidden>
        <img
          src={AUTH_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[58%_top]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-char-950 via-char-950/70 to-char-950/25" />
        <VoltGlow subtle />
        <div className="relative flex h-full flex-col justify-end p-10">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-volt-400/30 bg-white/5 px-3 py-1 text-xs font-medium text-volt-100 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-volt-400" />
            {t("home.badge")}
          </span>
          <p className="mt-5 font-display text-3xl font-bold leading-tight text-white">
            {t("home.titleLine1")}
            <br />
            <span className="bg-volt-ember bg-clip-text text-transparent">
              {t("home.titleLine2")}
            </span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-char-200">
            {t("auth.loginTagline")}
          </p>
        </div>
      </aside>
    </div>
  );
}

/** One input + label + error, so the two forms cannot drift apart. */
export function AuthField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export const authInputClass =
  "mt-1.5 w-full rounded-lg border border-char-700 bg-char-950/60 px-3.5 py-2.5 text-slate-900 transition placeholder:text-char-400 focus:border-volt-400 focus:outline-none focus:ring-2 focus:ring-volt-400/30";
