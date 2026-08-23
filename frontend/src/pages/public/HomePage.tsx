import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { coursesApi } from "../../api/courses";
import { subscriptionsApi } from "../../api/subscriptions";
import { AnimatedNumber } from "../../components/ui/AnimatedNumber";
import { AnimatedWords } from "../../components/ui/AnimatedWords";
import { Marquee } from "../../components/ui/Marquee";
import { Reveal } from "../../components/ui/Reveal";
import { TiltCard } from "../../components/ui/TiltCard";
import { OFFERINGS } from "../../data/offerings";
import type { Period } from "../../types/subscriptions";

const HERO_IMAGE = "/images/hero/Hero%20principal.png";
const CTA_IMAGE = "/images/hero/Hero%20secondaire.png";

type Stat = { value: string; label: string };
type Step = { n: string; title: string; description: string };
type Testimonial = { name: string; role: string; quote: string };

/** Bento layout for the 6 OFFERINGS tiles: one big hero tile, two wide tiles,
 *  two narrow tiles and one more wide tile. Only kicks in at the lg breakpoint. */
const BENTO_SPANS = [
  "sm:col-span-2 lg:col-span-2 lg:row-span-2",
  "lg:col-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
  "sm:col-span-2 lg:col-span-2",
  "sm:col-span-2 lg:col-span-2",
];

export function HomePage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>("monthly");

  const STATS = t("home.stats", { returnObjects: true }) as Stat[];
  const STEPS = t("home.steps", { returnObjects: true }) as Step[];
  const TESTIMONIALS = t("home.testimonials.items", {
    returnObjects: true,
  }) as Testimonial[];

  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: () => subscriptionsApi.listPlans(),
  });

  const coachesQuery = useQuery({
    queryKey: ["coaches"],
    queryFn: () => coursesApi.listCoaches(),
  });

  const filteredPlans =
    plansQuery.data?.results.filter((p) => p.period === period) ?? [];

  const heroRef = useRef<HTMLElement>(null);
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const node = heroRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    node.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div className="space-y-24 pb-24">
      <div>
      {/* === HERO === */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="group relative isolate overflow-hidden text-white"
      >
        <div
          className="absolute inset-0 -z-20 animate-kenburns bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-ink-950/85 via-ink-900/75 to-brand-900/70"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(600px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(226,196,255,0.32), rgba(192,132,252,0.1) 40%, transparent 70%)",
          }}
          aria-hidden
        />
        <div className="absolute -left-24 top-32 -z-10 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" aria-hidden />
        <div className="absolute -right-20 bottom-20 -z-10 h-96 w-96 rounded-full bg-brand-700/30 blur-3xl" aria-hidden />

        <div className="mx-auto max-w-7xl px-6 py-28 lg:py-40">
          <Reveal className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/40 bg-white/5 px-3 py-1 text-xs font-medium text-brand-100 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400"></span>
              {t("home.badge")}
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight md:text-6xl">
              <AnimatedWords
                words={t("home.titleLine1")
                  .split(" ")
                  .map((text: string) => ({ text }))}
              />
              <br />
              <AnimatedWords
                startDelay={100 + t("home.titleLine1").split(" ").length * 90}
                words={[
                  {
                    text: t("home.titleLine2"),
                    className:
                      "bg-gradient-to-r from-brand-300 to-brand-100 bg-clip-text text-transparent",
                  },
                ]}
              />
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-100 md:text-xl">
              {t("home.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 px-7 py-3.5 font-semibold text-white shadow-brand-glow transition hover:-translate-y-0.5 hover:opacity-90 active:scale-[0.97] active:translate-y-0"
              >
                {t("home.ctaStart")} →
              </Link>
              <Link
                to="/plans"
                className="rounded-lg border border-white/30 bg-white/5 px-7 py-3.5 font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10 active:scale-[0.97] active:translate-y-0"
              >
                {t("home.ctaPlans")}
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-ink-200">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">★★★★★</span>
                <span>{t("home.ratingValue")} {t("home.ratingText")}</span>
              </div>
              <span className="hidden h-4 w-px bg-white/20 md:block" />
              <span className="hidden md:inline">{t("home.noCommitment")}</span>
            </div>
          </Reveal>
        </div>

        <svg
          className="absolute inset-x-0 -bottom-1 h-16 w-full text-ink-50 md:h-24"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M0,40 C240,90 480,0 720,30 C960,60 1200,10 1440,50 L1440,100 L0,100 Z"
          />
        </svg>
      </section>

      {/* === MARQUEE === */}
      <Marquee
        className="bg-ink-900 py-4 text-white"
        items={OFFERINGS.map((group) => (
          <span key={group.key} className="flex items-center gap-3 font-display text-lg uppercase tracking-wide">
            <span aria-hidden>{group.icon}</span>
            {t(`offerings.${group.key}.title`)}
          </span>
        ))}
      />
      </div>

      {/* === TRUST STATS === */}
      <section className="mx-auto max-w-7xl px-4">
        <Reveal className="grid gap-4 rounded-2xl bg-surface p-8 shadow-sm md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <AnimatedNumber
                value={s.value}
                className="block text-3xl font-bold text-brand-700 md:text-4xl"
              />
              <p className="mt-1 text-sm text-ink-500">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* === NOTRE OFFRE — cards photo full-bleed === */}
      <section className="mx-auto max-w-7xl px-4">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
              {t("home.offerLabel")}
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink-900">
              {t("home.offerTitle")}
            </h2>
          </div>
          <Link
            to="/plans"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            {t("home.offerSeeAll")} →
          </Link>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[200px]">
          {OFFERINGS.map((group, index) => {
            const isLarge = index === 0;
            const showItems = index !== 2 && index !== 3;
            return (
              <Reveal
                key={group.key}
                delay={index * 80}
                className={BENTO_SPANS[index] ?? ""}
              >
                <TiltCard className="h-full">
                  <Link
                    to={group.items[0].href}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-md transition hover:shadow-brand-glow lg:aspect-auto lg:h-full"
                  >
                    <img
                      src={group.image}
                      alt={t(`offerings.${group.key}.title`)}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/50 to-ink-950/10" />
                    <div className="absolute inset-0 flex flex-col justify-end p-5 text-white sm:p-6">
                      <div className="flex items-center gap-2">
                        <span className={isLarge ? "text-4xl drop-shadow" : "text-2xl drop-shadow"}>
                          {group.icon}
                        </span>
                        <h3
                          className={`font-display font-bold ${isLarge ? "text-2xl" : "text-lg"}`}
                        >
                          {t(`offerings.${group.key}.title`)}
                        </h3>
                      </div>
                      {showItems && (
                        <ul className="mt-3 space-y-1 text-sm text-ink-100">
                          {group.items.map((it) => (
                            <li key={it.key} className="flex items-start gap-2">
                              <span className="mt-1 h-1 w-1 rounded-full bg-brand-300"></span>
                              {t(`offerings.${group.key}.items.${it.key}.label`)}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-4 flex items-center text-sm font-medium text-brand-200 opacity-0 transition group-hover:opacity-100">
                        {t("home.discoverMore")} →
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="bg-ink-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-400">
              {t("home.howItWorksLabel")}
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold">
              {t("home.howItWorksTitle")}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, index) => (
              <Reveal key={s.n} delay={index * 100}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:-translate-y-1 hover:border-brand-400/40">
                  <p className="bg-gradient-to-r from-brand-400 to-brand-200 bg-clip-text text-5xl font-bold text-transparent">
                    {s.n}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink-200">{s.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* === TARIFS === */}
      <section className="relative isolate mx-auto max-w-7xl overflow-hidden px-4">
        <div className="absolute -left-32 top-0 -z-10 h-80 w-80 rounded-full bg-brand-300/40 blur-3xl" aria-hidden />
        <div className="absolute -right-24 bottom-0 -z-10 h-96 w-96 rounded-full bg-accent-300/30 blur-3xl" aria-hidden />
        <Reveal className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
            {t("home.pricingLabel")}
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold text-ink-900">
            {t("home.pricingTitle")}
          </h2>
          <p className="mt-3 text-ink-700">
            {t("home.pricingSubtitle")}
          </p>
          <div className="mt-6 inline-flex rounded-full bg-ink-100 p-1">
            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition active:scale-95 ${
                period === "monthly"
                  ? "bg-surface text-ink-900 shadow-sm"
                  : "text-ink-700"
              }`}
            >
              {t("home.periodMonthly")}
            </button>
            <button
              type="button"
              onClick={() => setPeriod("yearly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition active:scale-95 ${
                period === "yearly"
                  ? "bg-surface text-ink-900 shadow-sm"
                  : "text-ink-700"
              }`}
            >
              {t("home.periodYearly")} <span className="ml-1 text-xs font-semibold text-accent-600">{t("home.yearlyDiscount")}</span>
            </button>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {filteredPlans.map((plan, index) => {
            const isPremium = plan.tier === "premium";
            return (
              <Reveal key={plan.id} delay={index * 100}>
                <div
                  className={`relative rounded-2xl border border-white/60 bg-white/60 p-8 shadow-sm ring-1 backdrop-blur-xl transition hover:-translate-y-1 ${
                    isPremium
                      ? "ring-brand-500 shadow-brand-glow"
                      : "ring-ink-200"
                  }`}
                >
                  {isPremium && (
                    <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-3 py-1 text-xs font-semibold text-white">
                      ⭐ {t("home.recommended")}
                    </span>
                  )}
                  <p
                    className={`text-xs font-bold uppercase tracking-wide ${
                      isPremium ? "text-brand-600" : "text-ink-500"
                    }`}
                  >
                    {plan.tier_display}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-ink-900">
                    {plan.name}
                  </h3>
                  <p className="mt-4">
                    <span className="text-5xl font-bold text-ink-900">
                      {Number(plan.price).toFixed(0)}
                    </span>
                    <span className="text-ink-500">
                      {" €"} / {plan.period === "monthly" ? t("home.perMonth") : t("home.perYear")}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-ink-700">{plan.description}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-ink-700">
                        <span className="mt-0.5 text-accent-600">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/plans"
                    className={`mt-6 block rounded-lg px-4 py-3 text-center font-medium transition active:scale-[0.97] ${
                      isPremium
                        ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white hover:opacity-90"
                        : "border border-ink-300 text-ink-700 hover:bg-ink-50"
                    }`}
                  >
                    {t("home.subscribe")}
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* === COACHS === */}
      <section className="relative isolate mx-auto max-w-7xl overflow-hidden px-4">
        <div className="absolute -right-32 top-10 -z-10 h-80 w-80 rounded-full bg-accent-300/30 blur-3xl" aria-hidden />
        <div className="absolute -left-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-brand-300/30 blur-3xl" aria-hidden />
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
              {t("home.teamLabel")}
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink-900">
              {t("home.teamTitle")}
            </h2>
          </div>
          <Link
            to="/coaches"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            {t("home.teamSeeAll")} →
          </Link>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coachesQuery.data?.results.slice(0, 3).map((coach, index) => (
            <Reveal key={coach.id} delay={index * 100}>
              <TiltCard>
              <Link
                to={`/coaches/${coach.id}`}
                className="group block rounded-2xl border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-brand-glow"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-2xl font-bold text-white">
                    {coach.first_name.charAt(0)}
                    {coach.last_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900 group-hover:text-brand-700">
                      {coach.full_name}
                    </p>
                    <p className="text-sm text-ink-500">
                      {coach.coach_profile?.specialties || t("home.coachFallback")}
                    </p>
                  </div>
                </div>
                {coach.coach_profile?.bio && (
                  <p className="mt-4 line-clamp-3 text-sm text-ink-700">
                    {coach.coach_profile.bio}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-amber-500">
                    {"★".repeat(Math.round(coach.rating_average ?? 0))}
                    <span className="text-ink-200">
                      {"★".repeat(5 - Math.round(coach.rating_average ?? 0))}
                    </span>
                  </span>
                  <span className="text-ink-500">
                    {coach.rating_average
                      ? `${coach.rating_average.toFixed(1)} (${coach.rating_count})`
                      : t("home.teamBadgeNew")}
                  </span>
                </div>
              </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* === TÉMOIGNAGES === */}
      <section className="mx-auto max-w-7xl px-4">
        <Reveal className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
            {t("home.testimonialsLabel")}
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold text-ink-900">
            {t("home.testimonialsTitle")}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <Reveal key={item.name} delay={index * 100}>
              <div className="rounded-2xl border border-ink-200 bg-surface p-6 transition hover:-translate-y-1">
                <p className="text-amber-500">★★★★★</p>
                <p className="mt-3 text-sm text-ink-800">"{item.quote}"</p>
                <div className="mt-4 border-t border-ink-200 pt-4">
                  <p className="font-semibold text-ink-900">{item.name}</p>
                  <p className="text-xs text-ink-500">{item.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* === CTA FINAL avec photo en background === */}
      <section className="mx-auto max-w-7xl px-4">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl shadow-xl">
            <div
              className="absolute inset-0 -z-10 bg-cover bg-center"
              style={{ backgroundImage: `url('${CTA_IMAGE}')` }}
              aria-hidden
            />
            <div
              className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-700/90 via-ink-900/85 to-ink-950/90"
              aria-hidden
            />
            <div className="px-8 py-16 text-center text-white md:px-12 md:py-20">
              <h2 className="font-display text-3xl font-bold md:text-5xl">
                {t("home.ctaBottomTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-ink-100">
                {t("home.ctaBottomSubtitle")}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/register"
                  className="rounded-lg bg-white px-8 py-3 font-semibold text-brand-700 shadow-brand-glow transition hover:-translate-y-0.5 hover:bg-brand-50 active:scale-[0.97] active:translate-y-0"
                >
                  {t("home.ctaCreateAccount")} →
                </Link>
                <Link
                  to="/coaches"
                  className="rounded-lg border border-white/40 px-8 py-3 font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10 active:scale-[0.97] active:translate-y-0"
                >
                  {t("home.ctaMeetCoaches")}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
