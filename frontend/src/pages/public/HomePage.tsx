import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const features = [
  {
    icon: "🏋️",
    title: "Une équipe au top",
    description:
      "Coachs diplômés, programmes adaptés à votre niveau et progression suivie.",
  },
  {
    icon: "📅",
    title: "Planning en temps réel",
    description:
      "Réservez votre place en quelques secondes. Yoga, fitness, tennis, piscine et plus encore.",
  },
  {
    icon: "💳",
    title: "Sans engagement",
    description:
      "Mensuel ou annuel. Paiement sécurisé Stripe. Annulation à tout moment.",
  },
  {
    icon: "📱",
    title: "Tout dans votre poche",
    description:
      "Tableau de bord personnel, recommandations de séances et suivi de votre activité.",
  },
];

const stats = [
  { value: "10+", label: "Cours collectifs" },
  { value: "3", label: "Coachs experts" },
  { value: "7", label: "Salles équipées" },
  { value: "7j/7", label: "Ouvert" },
];

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 p-8 text-white shadow-xl md:p-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-100">
            FitZone
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
            {t("home.hero")}
          </h1>
          <p className="mt-4 text-lg text-brand-50/90 md:text-xl">
            {t("home.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-md bg-white px-6 py-3 font-semibold text-brand-700 shadow transition hover:bg-brand-50"
            >
              {t("nav.register")} →
            </Link>
            <Link
              to="/courses"
              className="rounded-md border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              {t("nav.courses")}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white p-6 text-center shadow-sm"
          >
            <p className="text-3xl font-bold text-brand-600">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Pourquoi FitZone ?
          </h2>
          <p className="mt-2 text-slate-600">
            Tout ce qu'il faut pour s'entraîner régulièrement, sans friction.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="text-4xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm md:p-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Prêt à commencer ?
            </h2>
            <p className="mt-3 text-slate-600">
              Créez votre compte gratuitement, choisissez la formule qui vous
              correspond et réservez votre première séance dès aujourd'hui.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/plans"
                className="rounded-md bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
              >
                Voir les abonnements
              </Link>
              <Link
                to="/coaches"
                className="rounded-md border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Rencontrer les coachs
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-slate-100 p-8 text-center">
            <p className="text-7xl">💪</p>
            <p className="mt-4 text-sm text-slate-600">
              Plus de 200 séances planifiées chaque semaine.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
