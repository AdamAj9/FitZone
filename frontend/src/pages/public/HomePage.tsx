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
import { Eyebrow } from "../../components/ui/Eyebrow";
import { VoltGlow } from "../../components/ui/VoltGlow";
import { OFFERINGS } from "../../data/offerings";
import { localizedPlan } from "../../lib/planCatalog";
import type { Period } from "../../types/subscriptions";
import { PillLink } from "../../components/ui/PillButton";

const HERO_IMAGE = "/images/home/hero-dexafit.webp";
const HERO_CUTOUT = "/images/home/hero-dexafit-cutout.webp";
const ABOUT_IMAGES = ["/images/home/about-1.webp", "/images/home/about-2.webp"];
const PROGRAM_IMAGES: Record<string, string> = {
  beginner: "/images/home/program-beginner.webp",
  intermediate: "/images/home/program-intermediate.webp",
  advanced: "/images/home/program-advanced.webp",
};
type Program = { level: string; tag: string; title: string; desc: string };
const COACH_AVATARS = [
  "/images/coaches/leo-durand.webp",
  "/images/coaches/sophie-martin.webp",
  "/images/coaches/thomas-lefevre.webp",
];
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
  const GHOST_LINES = t("home.ghostLines", { returnObjects: true }) as string[];
  const HERO_LINES = t("home.heroLines", { returnObjects: true }) as string[];
  const PROGRAMS = t("home.programs.items", { returnObjects: true }) as Program[];
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
      {/* === HERO — DEXAFIT layout: a framed card, copy pinned to the
          corners, ghost lettering on the right, glowing curved bottom edge === */}
      <div className="px-2 pt-2 sm:px-3 sm:pt-3">
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="group relative isolate flex min-h-[86vh] flex-col overflow-hidden rounded-[2rem] rounded-b-[3rem] bg-char-900 text-white shadow-[0_26px_50px_-26px_rgba(182,255,0,0.75),-14px_0_40px_-30px_rgba(182,255,0,0.55),14px_0_40px_-30px_rgba(182,255,0,0.55)] md:h-[calc(100vh-5.25rem)] md:min-h-[620px]"
      >
        {/* From lg up the photo is shown whole (contain, anchored right) so the
            bar and the athlete stay in frame on wide screens instead of being
            zoomed into the face. The strip it leaves on the left is filled by
            a blurred copy of the same photo, and the sharp one feathers into
            it — so there is no seam and no empty band. Phones keep cover. */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          className="absolute inset-0 -z-30 hidden h-full w-full scale-110 object-cover blur-2xl brightness-[0.55] lg:block"
        />
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          className="hero-feather absolute inset-0 -z-20 h-full w-full object-cover object-[60%_30%] lg:inset-auto lg:right-0 lg:top-0 lg:w-auto lg:max-w-none"
        />
        {/* The athlete, cut out of the same photo and laid over the ghost
            lettering so the words pass behind him, as in the reference. Same
            box and object-fit as the photo, so it lands on it pixel for pixel. */}
        <img
          src={HERO_CUTOUT}
          alt=""
          aria-hidden
          className="hero-feather absolute inset-0 -z-[12] h-full w-full object-cover object-[60%_30%] lg:inset-auto lg:right-0 lg:top-0 lg:w-auto lg:max-w-none"
        />
        {/* Mobile: the athlete sits behind the copy, so darken the whole frame. */}
        <div className="absolute inset-0 -z-10 bg-char-950/40 md:hidden" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(600px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(182,255,0,0.16), transparent 65%)",
          }}
          aria-hidden
        />

        {/* Ghost lettering, cropped by the card's right edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[2vh] top-[6%] -z-[15] hidden select-none whitespace-nowrap text-right lg:block"
        >
          {GHOST_LINES.map((line) => (
            <span
              key={line}
              className="block font-display text-[17vh] leading-[0.84] text-white/[0.12]"
            >
              {line}
            </span>
          ))}
        </div>

        <div className="relative flex w-full flex-1 flex-col justify-between px-6 pb-12 pt-10 sm:px-10 lg:px-16 lg:pb-16 lg:pt-14 2xl:px-28">
          <Reveal>
            <p className="max-w-sm indent-12 text-sm leading-relaxed text-char-200 md:text-base">
              {t("home.subtitle")}
            </p>
          </Reveal>

          <div>
            <h1 className="font-display text-[3.1rem] leading-[0.88] text-white sm:text-7xl lg:text-[6.75rem] xl:text-[7.5rem] 2xl:text-[10rem]">
              {/* One word group per line, all white, as in the reference. */}
              {HERO_LINES.map((line, i) => (
                <span key={line} className="block whitespace-nowrap">
                  <AnimatedWords
                    startDelay={100 + i * 160}
                    words={[{ text: line }]}
                  />
                </span>
              ))}
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillLink to="/register" size="lg">
                {t("home.ctaStart")}
              </PillLink>
              <PillLink to="/plans" size="lg" variant="ghost">
                {t("home.ctaPlans")}
              </PillLink>
            </div>
          </div>
        </div>
        {/* LED outline: down both sides and along the curved bottom, fading
            in from the top so the frame reads as lit from below. The glow is
            a drop-shadow on the wrapper because a mask would clip a
            box-shadow along with the border. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            filter:
              "drop-shadow(0 0 5px rgba(182,255,0,0.9)) drop-shadow(0 0 16px rgba(182,255,0,0.45))",
          }}
        >
          <div
            className="absolute inset-0 rounded-[2rem] rounded-b-[3rem] border-[3px] border-t-0 border-volt-400"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 6%, black 55%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 6%, black 55%)",
            }}
          />
        </div>
      </section>
      </div>

      {/* === MARQUEE === */}
      <Marquee
        className="mt-10 bg-char-900 py-4 text-white"
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

      {/* === À PROPOS — DEXAFIT "About us": rating column, two photos, copy === */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_2.2fr] lg:gap-14">
          <Reveal className="flex flex-col justify-between gap-10">
            <Eyebrow>{t("home.about.label")}</Eyebrow>
            <div>
              <p className="font-display text-7xl leading-none text-white">
                {t("home.about.ratingScore")}
              </p>
              <p className="mt-2 tracking-widest text-volt-400" aria-hidden>
                ★★★★★
              </p>
              <p className="mt-1 text-sm text-char-400">{t("home.about.ratingLabel")}</p>
              {/* The real coaches, not stock avatars. */}
              <div className="mt-5 flex items-center">
                {COACH_AVATARS.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    loading="lazy"
                    className={`h-11 w-11 rounded-full border-2 border-char-950 object-cover object-top ${
                      i > 0 ? "-ml-3" : ""
                    }`}
                  />
                ))}
                <span
                  aria-hidden
                  className="-ml-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-char-950 bg-volt-400 text-lg font-bold text-char-950"
                >
                  +
                </span>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <h2 className="max-w-3xl font-display text-4xl leading-[0.95] text-white md:text-6xl">
                <GradientTail text={t("home.about.title")} />
              </h2>
            </Reveal>
            <div className="mt-10 grid items-end gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.1fr]">
              {ABOUT_IMAGES.map((src, i) => (
                <Reveal key={src} delay={i * 120}>
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/5] w-full rounded-2xl object-cover ring-1 ring-char-800"
                  />
                </Reveal>
              ))}
              <Reveal delay={260} className="sm:col-span-2 lg:col-span-1">
                <p className="text-char-300">{t("home.about.body")}</p>
                <PillLink to="/coaches" className="mt-6">
                  {t("home.about.cta")}
                </PillLink>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* === PROGRAMMES PAR NIVEAU === */}
      <section className="mx-auto max-w-7xl px-4">
        <Reveal className="text-center">
          <Eyebrow center>{t("home.programs.label")}</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl leading-[0.95] text-white md:text-6xl">
            <GradientTail text={t("home.programs.title")} />
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PROGRAMS.map((program, i) => (
            <Reveal key={program.level} delay={i * 120}>
              <Link
                to={`/courses?level=${program.level}`}
                className="group relative block overflow-hidden rounded-3xl ring-1 ring-char-800 transition hover:shadow-volt-glow hover:ring-volt-400/60"
              >
                <img
                  src={PROGRAM_IMAGES[program.level]}
                  alt=""
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-char-950 via-char-950/45 to-transparent"
                />
                <span
                  aria-hidden
                  className="absolute right-5 top-4 font-display text-6xl text-white/15"
                >
                  0{i + 1}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-400">
                    {program.tag}
                  </p>
                  <h3 className="mt-2 font-display text-3xl leading-none text-white">
                    {program.title}
                  </h3>
                  <p className="mt-3 text-sm text-char-300">{program.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-3 font-display text-sm tracking-wide text-white">
                    {t("home.programs.cta")}
                    <span
                      aria-hidden
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-volt-400 text-char-950 transition-transform duration-300 group-hover:-rotate-45"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

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
