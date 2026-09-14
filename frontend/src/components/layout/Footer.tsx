import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { CONTACT_INFO } from "../../lib/contactInfo";

function Icon({ d }: { d: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-volt-400"
    >
      <path d={d} />
    </svg>
  );
}

const PIN = "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z";
const PHONE = "M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z";
const MAIL = "M4 6h16v12H4zM4 7l8 6 8-6";

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
    // The curved, glowing top edge and the cropped giant wordmark are the two
    // signature moves of the DEXAFIT footer.
    <footer className="relative mt-auto overflow-hidden rounded-t-[2.5rem] border-t border-volt-400/50 bg-char-950 text-char-300 shadow-[0_-18px_50px_-30px_rgba(182,255,0,0.55)]">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Link to="/" className="inline-flex">
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
            <ul className="mt-6 space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <Icon d={PIN} />
                {t("footer.address")}
              </li>
              <li className="flex items-center gap-2.5">
                <Icon d={PHONE} />
                <a href={CONTACT_INFO.phoneHref} className="transition hover:text-volt-400">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Icon d={MAIL} />
                <a href={`mailto:${CONTACT_INFO.email}`} className="transition hover:text-volt-400">
                  {CONTACT_INFO.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs text-char-500">[{col.title}]</p>
                <ul className="mt-3">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="group flex items-center justify-between border-b border-char-800 py-2.5 font-display text-lg tracking-wide text-char-100 transition hover:border-volt-400/50 hover:text-volt-400"
                      >
                        {l.label}
                        <span
                          aria-hidden
                          className="text-volt-400 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 text-xs text-char-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} FitZone — TFE — {t("footer.rights")}
          </p>
          <p>{t("footer.madeIn")} 🇧🇪</p>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none mt-8 select-none overflow-hidden">
        <p className="translate-y-[22%] bg-gradient-to-b from-char-50 via-char-50/50 to-char-50/0 bg-clip-text text-center font-display text-[24vw] leading-[0.8] text-transparent">
          FitZone
        </p>
      </div>
    </footer>
  );
}
