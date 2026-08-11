import { Link } from "react-router-dom";

const COLUMNS = [
  {
    title: "Découvrir",
    links: [
      { label: "Cours", to: "/courses" },
      { label: "Planning", to: "/planning" },
      { label: "Coachs", to: "/coaches" },
      { label: "Abonnements", to: "/plans" },
    ],
  },
  {
    title: "Mon compte",
    links: [
      { label: "Connexion", to: "/login" },
      { label: "Inscription", to: "/register" },
      { label: "Tableau de bord", to: "/dashboard" },
      { label: "Mes réservations", to: "/my-bookings" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", to: "/" },
      { label: "Conditions générales", to: "/" },
      { label: "Politique de confidentialité", to: "/" },
      { label: "Cookies", to: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-ink-950 text-ink-300">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
          <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-white"
            >
              <img
                src="/images/logo1.png"
                alt="FitZone"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-ink-300">
              Votre salle de sport généraliste : fitness, piscine, tennis,
              padel, hammam, coworking — tout sous un même toit.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span>📍</span> 42 rue de la Forme, 1000 Bruxelles
              </p>
              <p className="flex items-center gap-2">
                <span>📞</span> +32 2 555 12 34
              </p>
              <p className="flex items-center gap-2">
                <span>✉️</span> hello@fitzone.local
              </p>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-bold uppercase tracking-wider text-white">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-ink-300 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink-800 pt-6 text-xs text-ink-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} FitZone — TFE — Tous droits réservés.
          </p>
          <p>Conçu et développé en Belgique 🇧🇪</p>
        </div>
      </div>
    </footer>
  );
}
