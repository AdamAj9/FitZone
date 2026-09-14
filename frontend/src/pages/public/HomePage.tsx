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
import { GradientTail } from "../../components/ui/GradientTail";
import { VoltGlow } from "../../components/ui/VoltGlow";
import { OFFERINGS } from "../../data/offerings";
import { localizedPlan } from "../../lib/planCatalog";
import type { Period } from "../../types/subscriptions";
import { PillLink } from "../../components/ui/PillButton";

const HERO_IMAGE = "/images/hero/hero-volt-ember.webp";
const CTA_IMAGE = "/images/hero/hero-secondaire.webp";

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
    <div className="space-y-24 bg-char-950 pb-24">
      <div>
      {/* === HERO === */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="group relative isolate flex min-h-[88vh] items-center overflow-hidden text-white md:min-h-[34rem] md:max-h-[92vh] md:aspect-[2.5/1]"
      >
        <div
          className="absolute inset-0 -z-20 animate-kenburns bg-cover bg-[position:44%_top] bg-no-repeat md:bg-top"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-char-950/92 via-char-950/55 to-char-950/10"
          aria-hidden
        />
        {/* Mobile only: the crop puts the models right behind the copy, so we
            add a flat scrim to keep the headline readable. */}
        <div className="absolute inset-0 -z-10 bg-char-950/45 md:hidden" aria-hidden />
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-3/4"
          style={{
            background:
              "linear-gradient(to top, #111412 0%, rgba(17,20,18,0.95) 7%, rgba(10,12,11,0.84) 18%, rgba(8,10,9,0.64) 34%, rgba(8,10,9,0.4) 52%, rgba(8,10,9,0.19) 72%, rgba(8,10,9,0.05) 88%, rgba(8,10,9,0) 100%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(600px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(182,255,0,0.18), rgba(255,106,0,0.12) 45%, transparent 70%)",
          }}
          aria-hidden
        />

        {/* Wider than the navbar container from 2xl up: on very large screens
            the centred max-w-7xl pushed the copy onto the athletes' torsos. */}
        <div className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:py-28 2xl:max-w-[100rem]">
          <Reveal className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-volt-400/30 bg-white/5 px-3 py-1 text-xs font-medium text-volt-100 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-volt-400"></span>
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
                    className: "bg-volt-ember bg-clip-text text-transparent",
                  },
                ]}
              />
            </h1>
            <p className="mt-5 max-w-lg text-lg text-char-200 md:text-xl">
              {t("home.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillLink to="/register" size="lg">
                {t("home.ctaStart")}
              </PillLink>
              <PillLink to="/plans" size="lg" variant="ghost">
                {t("home.ctaPlans")}
              </PillLink>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-char-300">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">★★★★★</span>
                <span>{t("home.ratingValue")} {t("home.ratingText")}</span>
              </div>
              <span className="hidden h-4 w-px bg-white/15 md:block" />
              <span className="hidden md:inline">{t("home.noCommitment")}</span>
            </div>
          </Reveal>
        </div>

      </section>

      {/* === MARQUEE === */}
      <Marquee
        className="bg-char-900 py-4 text-white"
        items={OFFERINGS.map((group) => (
          <span key={group.key} className="flex items-center gap-3 font-display text-lg uppercase tracking-wide">
            <span aria-hidden>{group.icon}</span>
            {t(`offerings.${group.key}.title`)}
            <span className="text-volt-400" aria-hidden>✦</span>
          </span>
        ))}
      />
      {/* The hero now dissolves into the marquee rather than butting against
          it, so the strip needs a soft bottom edge to match. */}
      <div className="h-20 bg-gradient-to-b from-char-900 to-char-950" aria-hidden />
      </div>

      {/* === TRUST STATS — full-bleed dark separator band === */}
      <section className="relative isolate w-full overflow-hidden bg-char-900 py-16">
        <VoltGlow subtle />
        <Reveal className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <AnimatedNumber
                value={s.value}
                className="block bg-volt-ember bg-clip-text font-display text-3xl font-bold text-transparent md:text-4xl"
              />
              <p className="mt-2 text-sm text-char-300">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* === NOTRE OFFRE / INSTALLATIONS — cards photo full-bleed === */}
      <section className="mx-auto max-w-7xl px-4">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-volt-400">
              {t("home.offerLabel")}
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold text-white">
              <GradientTail text={t("home.offerTitle")} />
            </h2>
          </div>
          <Link
            to="/plans"
            className="text-sm font-semibold text-volt-400 hover:underline"
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
                    className="group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-md ring-1 ring-char-800 transition hover:shadow-volt-glow hover:ring-volt-400/50 lg:aspect-auto lg:h-full"
                  >
                    <img
                      src={group.image}
                      alt={t(`offerings.${group.key}.title`)}
                      className="absolute inset-0 h-full w-full object-cover grayscale-[30%] transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-char-950/95 via-char-950/55 to-char-950/15" />
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
                        <ul className="mt-3 space-y-1 text-sm text-char-200">
                          {group.items.map((it) => (
                            <li key={it.key} className="flex items-start gap-2">
                              <span className="mt-1 h-1 w-1 rounded-full bg-volt-400"></span>
                              {t(`offerings.${group.key}.items.${it.key}.label`)}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-4 flex items-center text-sm font-medium text-volt-300 opacity-0 transition group-hover:opacity-100">
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
      <section className="bg-char-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-volt-400">
              {t("home.howItWorksLabel")}
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold">
              {t("home.howItWorksTitle")}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, index) => (
              <Reveal key={s.n} delay={index * 100}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:-translate-y-1 hover:border-volt-400/40">
                  <p className="bg-volt-ember bg-clip-text font-display text-5xl font-bold text-transparent">
                    {s.n}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-char-300">{s.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* === TARIFS / ABONNEMENTS === */}
      <section className="relative isolate mx-auto max-w-7xl overflow-hidden px-4">
        <VoltGlow subtle />
        <Reveal className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-volt-400">
            {t("home.pricingLabel")}
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold text-white">
            <GradientTail text={t("home.pricingTitle")} />
          </h2>
          <p className="mt-3 text-char-300">
            {t("home.pricingSubtitle")}
          </p>
          <div className="mt-6 inline-flex rounded-full border border-char-800 bg-char-900 p-1">
            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition active:scale-95 ${
                period === "monthly"
                  ? "bg-volt-400 text-char-950"
                  : "text-char-300"
              }`}
            >
              {t("home.periodMonthly")}
            </button>
            <button
              type="button"
              onClick={() => setPeriod("yearly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition active:scale-95 ${
                period === "yearly"
                  ? "bg-volt-400 text-char-950"
                  : "text-char-300"
              }`}
            >
              {t("home.periodYearly")} <span className="ml-1 text-xs font-semibold text-ember-400">{t("home.yearlyDiscount")}</span>
            </button>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {filteredPlans.map((plan, index) => {
            const isPremium = plan.tier === "premium";
            const { name, description, features } = localizedPlan(t, plan);
            const card = (
              <div
                className={`relative h-full rounded-2xl border p-8 backdrop-blur-xl transition hover:-translate-y-1 ${
                  isPremium
                    ? "border-transparent bg-char-900"
                    : "border-char-800 bg-char-900/60 shadow-sm"
                }`}
              >
                {isPremium && (
                  <span className="absolute -top-3 right-6 rounded-full bg-volt-ember px-3 py-1 text-xs font-bold text-char-950">
                    ⭐ {t("home.recommended")}
                  </span>
                )}
                <p
                  className={`text-xs font-bold uppercase tracking-wide ${
                    isPremium ? "text-volt-400" : "text-char-400"
                  }`}
                >
                  {plan.tier_display}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  {name}
                </h3>
                <p className="mt-4">
                  <span className="text-5xl font-bold text-white">
                    {Number(plan.price).toFixed(0)}
                  </span>
                  <span className="text-char-400">
                    {" €"} / {plan.period === "monthly" ? t("home.perMonth") : t("home.perYear")}
                  </span>
                </p>
                <p className="mt-2 text-sm text-char-300">{description}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-char-200">
                      <span className="mt-0.5 text-volt-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/plans"
                  className={`mt-6 block rounded-lg px-4 py-3 text-center font-medium transition active:scale-[0.97] ${
                    isPremium
                      ? "bg-volt-ember text-char-950 hover:opacity-90"
                      : "border border-char-700 text-char-200 hover:bg-white/5"
                  }`}
                >
                  {t("home.subscribe")}
                </Link>
              </div>
            );
            return (
              <Reveal key={plan.id} delay={index * 100}>
                {isPremium ? (
                  <div className="h-full rounded-2xl bg-volt-ember p-[2px] shadow-volt-glow">
                    {card}
                  </div>
                ) : (
                  card
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* === COACHS === */}
      <section className="relative isolate mx-auto max-w-7xl overflow-hidden px-4">
        <VoltGlow subtle flip />
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-volt-400">
              {t("home.teamLabel")}
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold text-white">
              <GradientTail text={t("home.teamTitle")} />
            </h2>
          </div>
          <Link
            to="/coaches"
            className="text-sm font-semibold text-volt-400 hover:underline"
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
                className="group block rounded-2xl border border-char-800 bg-char-900/70 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-volt-400/50 hover:shadow-volt-glow"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-volt-ember text-2xl font-bold text-char-950">
                    {coach.first_name.charAt(0)}
                    {coach.last_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-volt-400">
                      {coach.full_name}
                    </p>
                    <p className="text-sm text-char-400">
                      {coach.coach_profile?.specialties || t("home.coachFallback")}
                    </p>
                  </div>
                </div>
                {coach.coach_profile?.bio && (
                  <p className="mt-4 line-clamp-3 text-sm text-char-300">
                    {coach.coach_profile.bio}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-amber-500">
                    {"★".repeat(Math.round(coach.rating_average ?? 0))}
                    <span className="text-char-700">
                      {"★".repeat(5 - Math.round(coach.rating_average ?? 0))}
                    </span>
                  </span>
                  <span className="text-char-400">
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
          <p className="text-sm font-bold uppercase tracking-wider text-volt-400">
            {t("home.testimonialsLabel")}
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold text-white">
            {t("home.testimonialsTitle")}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <Reveal key={item.name} delay={index * 100}>
              <div className="rounded-2xl border border-char-800 bg-char-900 p-6 transition hover:-translate-y-1">
                <p className="text-amber-500">★★★★★</p>
                <p className="mt-3 text-sm text-char-100">"{item.quote}"</p>
                <div className="mt-4 border-t border-char-800 pt-4">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-char-400">{item.role}</p>
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
              className="absolute inset-0 -z-20 bg-cover bg-center grayscale-[55%]"
              style={{ backgroundImage: `url('${CTA_IMAGE}')` }}
              aria-hidden
            />
            <div
              className="absolute inset-0 -z-10 bg-gradient-to-br from-char-950/95 via-char-950/88 to-char-950/95"
              aria-hidden
            />
            <VoltGlow flip />
            <div className="relative px-8 py-16 text-center text-white md:px-12 md:py-20">
              <h2 className="font-display text-3xl font-bold md:text-5xl">
                {t("home.ctaBottomTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-char-200">
                {t("home.ctaBottomSubtitle")}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <PillLink to="/register" size="lg">
                  {t("home.ctaCreateAccount")}
                </PillLink>
                <PillLink to="/coaches" size="lg" variant="ghost">
                  {t("home.ctaMeetCoaches")}
                </PillLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
