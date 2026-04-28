import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";

import { coursesApi } from "../../api/courses";
import { subscriptionsApi } from "../../api/subscriptions";
import { OFFERINGS } from "../../data/offerings";
import type { Period } from "../../types/subscriptions";

const STATS = [
  { value: "200+", label: "Séances par semaine" },
  { value: "10+", label: "Cours collectifs" },
  { value: "7", label: "Espaces dédiés" },
  { value: "7j/7", label: "Ouvert non-stop" },
];

const STEPS = [
  {
    n: "01",
    title: "Crée ton compte",
    description: "Inscription gratuite en 30 secondes, aucune carte requise.",
  },
  {
    n: "02",
    title: "Choisis ta formule",
    description:
      "Basic ou Premium, mensuel ou annuel — change à tout moment.",
  },
  {
    n: "03",
    title: "Réserve & profite",
    description:
      "Planning en temps réel, plus de 200 séances par semaine, partout dans la salle.",
  },
];

const TESTIMONIALS = [
  {
    name: "Marie L.",
    role: "Membre Premium depuis 2 ans",
    quote:
      "L'appli est super intuitive. Je réserve mes cours de yoga et de natation en deux clics, et le coach voit qui vient — ça change tout.",
  },
  {
    name: "Karim B.",
    role: "Membre Basic",
    quote:
      "Le rapport qualité-prix imbattable. Salle propre, équipement neuf, et je peux acheter une séance de tennis quand l'envie me prend.",
  },
  {
    name: "Sophie M.",
    role: "Coach yoga",
    quote:
      "Côté coach, le tableau de bord est ultra clair. Je vois mes prochaines séances, qui s'inscrit, mes notes — tout au même endroit.",
  },
];

export function HomePage() {
  const [period, setPeriod] = useState<Period>("monthly");

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

  return (
    <div className="space-y-24 pb-24">
      {/* === HERO === */}
      <section className="relative overflow-hidden bg-hero-gradient text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-24 lg:grid-cols-2 lg:py-32">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/40 bg-surface/5 px-3 py-1 text-xs font-medium text-brand-100 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400"></span>
              Nouvelle salle ouverte 7j/7
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
              Le sport,<br />
              <span className="bg-gradient-to-r from-brand-300 to-brand-100 bg-clip-text text-transparent">
                ré-imaginé.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-200">
              Salles de fitness, piscine, tennis, padel, hammam, coworking…
              tout sous un même toit. Réservation en ligne, paiement sécurisé,
              progression suivie.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 px-6 py-3 font-semibold text-white shadow-brand-glow transition hover:opacity-90"
              >
                Commencer gratuitement →
              </Link>
              <Link
                to="/plans"
                className="rounded-lg border border-white/30 px-6 py-3 font-semibold backdrop-blur transition hover:bg-surface/10"
              >
                Voir les abonnements
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-ink-300">
              <div className="flex items-center gap-2">
                <span className="text-brand-300">★★★★★</span>
                <span>4,8 / 5 sur 200+ avis</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -left-10 top-0 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 h-80 w-80 rounded-full bg-brand-700/40 blur-3xl"></div>
            <div className="relative grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-surface/10 p-6 backdrop-blur-md">
                <p className="text-5xl">🏋️</p>
                <p className="mt-3 text-sm text-ink-200">Salle fitness</p>
                <p className="font-semibold">2 000 m² équipés</p>
              </div>
              <div className="mt-10 rounded-3xl bg-brand-500/30 p-6 backdrop-blur-md">
                <p className="text-5xl">🏊</p>
                <p className="mt-3 text-sm text-ink-200">Piscine 25 m</p>
                <p className="font-semibold">+ hammam, sauna</p>
              </div>
              <div className="rounded-3xl bg-brand-700/30 p-6 backdrop-blur-md">
                <p className="text-5xl">🎾</p>
                <p className="mt-3 text-sm text-ink-200">Tennis & padel</p>
                <p className="font-semibold">5 courts indoor</p>
              </div>
              <div className="mt-10 rounded-3xl bg-surface/10 p-6 backdrop-blur-md">
                <p className="text-5xl">💼</p>
                <p className="mt-3 text-sm text-ink-200">Coworking</p>
                <p className="font-semibold">Lounge & meeting</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === TRUST STATS === */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-4 rounded-2xl bg-surface p-8 shadow-sm md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-brand-700 md:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === NOTRE OFFRE === */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
              Notre offre
            </p>
            <h2 className="mt-2 text-4xl font-bold text-ink-900">
              Un univers complet, sous un même toit
            </h2>
          </div>
          <Link
            to="/plans"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            Tous les abonnements →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {OFFERINGS.map((group) => (
            <div
              key={group.title}
              className="group relative overflow-hidden rounded-2xl border border-ink-200 bg-surface p-6 transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-brand-glow"
            >
              <div className="text-4xl">{group.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-ink-900">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-1 text-sm text-ink-600">
                {group.items.map((it) => (
                  <li key={it.label} className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 rounded-full bg-brand-500"></span>
                    {it.label}
                  </li>
                ))}
              </ul>
              <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-400 to-brand-700 transition-transform group-hover:scale-x-100"></div>
            </div>
          ))}
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="bg-ink-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-400">
              Comment ça marche ?
            </p>
            <h2 className="mt-2 text-4xl font-bold">
              Trois étapes pour démarrer
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/10 bg-surface/5 p-8 backdrop-blur"
              >
                <p className="bg-gradient-to-r from-brand-400 to-brand-200 bg-clip-text text-5xl font-bold text-transparent">
                  {s.n}
                </p>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-200">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === TARIFS === */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
            Tarifs
          </p>
          <h2 className="mt-2 text-4xl font-bold text-ink-900">
            Des formules pour tous les rythmes
          </h2>
          <p className="mt-3 text-ink-600">
            Sans engagement, annulable à tout moment.
          </p>
          <div className="mt-6 inline-flex rounded-full bg-ink-100 p-1">
            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                period === "monthly"
                  ? "bg-surface text-ink-900 shadow-sm"
                  : "text-ink-500"
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setPeriod("yearly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                period === "yearly"
                  ? "bg-surface text-ink-900 shadow-sm"
                  : "text-ink-500"
              }`}
            >
              Annuel <span className="ml-1 text-xs text-brand-600">−2 mois</span>
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {filteredPlans.map((plan) => {
            const isPremium = plan.tier === "premium";
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl bg-surface p-8 shadow-sm ring-1 transition hover:-translate-y-1 ${
                  isPremium
                    ? "ring-brand-500 shadow-brand-glow"
                    : "ring-ink-200"
                }`}
              >
                {isPremium && (
                  <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-3 py-1 text-xs font-semibold text-white">
                    ⭐ Recommandé
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
                    {" €"} / {plan.period === "monthly" ? "mois" : "an"}
                  </span>
                </p>
                <p className="mt-2 text-sm text-ink-600">{plan.description}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-ink-700">
                      <span className="mt-0.5 text-brand-600">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/plans"
                  className={`mt-6 block rounded-lg px-4 py-3 text-center font-medium transition ${
                    isPremium
                      ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white hover:opacity-90"
                      : "border border-ink-300 text-ink-700 hover:bg-ink-50"
                  }`}
                >
                  Souscrire
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* === COACHS === */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
              Notre équipe
            </p>
            <h2 className="mt-2 text-4xl font-bold text-ink-900">
              Des coachs à votre écoute
            </h2>
          </div>
          <Link
            to="/coaches"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            Tous les coachs →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coachesQuery.data?.results.slice(0, 3).map((coach) => (
            <Link
              key={coach.id}
              to={`/coaches/${coach.id}`}
              className="group rounded-2xl border border-ink-200 bg-surface p-6 transition hover:border-brand-400 hover:shadow-brand-glow"
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
                    {coach.coach_profile?.specialties || "Coach FitZone"}
                  </p>
                </div>
              </div>
              {coach.coach_profile?.bio && (
                <p className="mt-4 line-clamp-3 text-sm text-ink-600">
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
                    : "Nouveau"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* === TÉMOIGNAGES === */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
            Témoignages
          </p>
          <h2 className="mt-2 text-4xl font-bold text-ink-900">
            Ils en parlent mieux que nous
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-ink-200 bg-surface p-6"
            >
              <p className="text-amber-500">★★★★★</p>
              <p className="mt-3 text-sm text-ink-700">"{t.quote}"</p>
              <div className="mt-4 border-t border-ink-100 pt-4">
                <p className="font-semibold text-ink-900">{t.name}</p>
                <p className="text-xs text-ink-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === CTA FINAL === */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-800 to-ink-900 p-12 text-center text-white md:p-16">
          <h2 className="text-3xl font-bold md:text-5xl">
            Prêt à passer la porte ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-200">
            Inscription gratuite. Choisis ta formule, réserve ta première
            séance, c'est parti.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="rounded-lg bg-surface px-8 py-3 font-semibold text-brand-700 shadow-brand-glow transition hover:bg-brand-50"
            >
              Créer mon compte →
            </Link>
            <Link
              to="/coaches"
              className="rounded-lg border border-white/30 px-8 py-3 font-semibold backdrop-blur transition hover:bg-surface/10"
            >
              Rencontrer les coachs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
