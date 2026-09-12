import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { CONTACT_INFO } from "../../lib/contactInfo";

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
        { label: t("nav.contact"), to: "/contact" },
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
        { label: t("footer.legalNotice"), to: "/legal/notice" },
        { label: t("footer.terms"), to: "/legal/terms" },
        { label: t("footer.privacy"), to: "/legal/privacy" },
        { label: t("footer.cookies"), to: "/legal/cookies" },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-char-800 bg-char-950 text-char-300">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
          <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-white"
            >
              <img
                src="/images/logo1-volt.webp"
                alt="FitZone"
                className="h-16 w-auto object-contain"
                loading="lazy"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-char-400">
              {t("footer.description")}
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span>📍</span> {t("footer.address")}
              </p>
              <p className="flex items-center gap-2">
                <span aria-hidden>📞</span>
                <a href={CONTACT_INFO.phoneHref} className="transition hover:text-volt-400">
                  {CONTACT_INFO.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span aria-hidden>✉️</span>
                <a href={`mailto:${CONTACT_INFO.email}`} className="transition hover:text-volt-400">
                  {CONTACT_INFO.email}
                </a>
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
                      className="text-sm text-char-400 transition hover:text-volt-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-char-800 pt-6 text-xs text-char-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} FitZone — TFE — {t("footer.rights")}
          </p>
          <p>{t("footer.madeIn")} 🇧🇪</p>
        </div>
      </div>
    </footer>
  );
}
