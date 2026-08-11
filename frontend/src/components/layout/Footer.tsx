import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Footer() {
  const { t } = useTranslation();

  const COLUMNS = [
    {
      title: t("footer.discoverTitle"),
      links: [
        { label: t("nav.courses"), to: "/courses" },
        { label: t("nav.planning"), to: "/planning" },
        { label: t("nav.coaches"), to: "/coaches" },
        { label: t("nav.plans"), to: "/plans" },
      ],
    },
    {
      title: t("footer.accountTitle"),
      links: [
        { label: t("nav.login"), to: "/login" },
        { label: t("nav.register"), to: "/register" },
        { label: t("nav.dashboard"), to: "/dashboard" },
        { label: t("footer.myBookings"), to: "/my-bookings" },
      ],
    },
    {
      title: t("footer.legalTitle"),
      links: [
        { label: t("footer.legalNotice"), to: "/" },
        { label: t("footer.terms"), to: "/" },
        { label: t("footer.privacy"), to: "/" },
        { label: t("footer.cookies"), to: "/" },
      ],
    },
  ];

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
              {t("footer.description")}
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span>📍</span> {t("footer.address")}
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
            © {new Date().getFullYear()} FitZone — TFE — {t("footer.rights")}
          </p>
          <p>{t("footer.madeIn")} 🇧🇪</p>
        </div>
      </div>
    </footer>
  );
}
