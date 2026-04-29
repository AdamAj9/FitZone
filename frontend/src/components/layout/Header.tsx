import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { OFFERINGS } from "../../data/offerings";
import { useLogout } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/auth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    isActive
      ? "text-brand-700 bg-brand-50"
      : "text-ink-700 hover:text-brand-700 hover:bg-ink-100"
  }`;

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2 text-base font-medium rounded-md ${
    isActive
      ? "text-brand-700 bg-brand-50"
      : "text-ink-700 hover:bg-ink-100"
  }`;

export function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();
  const [open, setOpen] = useState(false);
  const [mobileOfferOpen, setMobileOfferOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
    setMobileOfferOpen(false);
  };

  const toggleLang = () => {
    void i18n.changeLanguage(i18n.language.startsWith("fr") ? "en" : "fr");
  };

  const handleLogout = () => {
    closeMenu();
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate("/", { replace: true }),
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold"
          onClick={closeMenu}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            F
          </span>
          <span className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
            FitZone
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" end className={navLinkClass}>
            {t("nav.home")}
          </NavLink>

          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-brand-700"
            >
              Notre offre
              <svg
                className="h-4 w-4 transition-transform group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="w-[920px] overflow-hidden rounded-2xl border border-ink-200 bg-surface shadow-2xl">
                <div className="grid grid-cols-3 gap-6 p-6">
                  {OFFERINGS.map((group) => (
                    <Link
                      key={group.title}
                      to={group.items[0]?.href ?? "/courses"}
                      className="group/item relative overflow-hidden rounded-xl border border-ink-200 bg-ink-100 transition hover:border-brand-400 hover:shadow-brand-glow"
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={group.image}
                          alt={group.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-transparent" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                        <p className="flex items-center gap-1.5 text-sm font-semibold">
                          <span>{group.icon}</span>
                          {group.title}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-ink-100">
                          {group.items.map((i) => i.label).join(" · ")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="flex items-center justify-between bg-ink-900 px-6 py-4 text-white">
                  <div>
                    <p className="text-sm font-semibold">
                      Découvrez tout l'univers FitZone
                    </p>
                    <p className="text-xs text-ink-200">
                      Plus de 200 séances par semaine, 7 espaces dédiés.
                    </p>
                  </div>
                  <Link
                    to="/plans"
                    className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium hover:bg-brand-600"
                  >
                    Voir les abonnements →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <NavLink to="/courses" className={navLinkClass}>
            {t("nav.courses")}
          </NavLink>
          <NavLink to="/planning" className={navLinkClass}>
            {t("nav.planning")}
          </NavLink>
          <NavLink to="/coaches" className={navLinkClass}>
            {t("nav.coaches")}
          </NavLink>
          <NavLink to="/plans" className={navLinkClass}>
            {t("nav.plans")}
          </NavLink>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={toggleLang}
            className="rounded-md border border-ink-200 px-2 py-1 text-xs font-medium text-ink-700 hover:bg-ink-100"
          >
            {i18n.language.startsWith("fr") ? "EN" : "FR"}
          </button>
          {user ? (
            <>
              {user.role === "admin" && (
                <NavLink
                  to="/admin"
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Admin
                </NavLink>
              )}
              {user.role === "coach" && (
                <NavLink
                  to="/coach"
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Coach
                </NavLink>
              )}
              <NavLink to="/dashboard" className={navLinkClass}>
                {t("nav.dashboard")}
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 disabled:opacity-50"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                {t("nav.login")}
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-2 text-sm font-medium text-white shadow-brand-glow transition hover:opacity-90"
              >
                {t("nav.register")}
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-ink-700 hover:bg-ink-100 lg:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-200 bg-surface px-3 py-3 lg:hidden">
          <nav className="space-y-1">
            <NavLink to="/" end onClick={closeMenu} className={mobileNavLinkClass}>
              {t("nav.home")}
            </NavLink>

            <button
              type="button"
              onClick={() => setMobileOfferOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-md px-4 py-2 text-base font-medium text-ink-700 hover:bg-ink-100"
            >
              Notre offre
              <span
                className={`transition-transform ${
                  mobileOfferOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            {mobileOfferOpen && (
              <div className="rounded-md bg-ink-50 p-3">
                {OFFERINGS.map((group) => (
                  <div key={group.title} className="mb-4 last:mb-0">
                    <p className="px-2 text-xs font-bold uppercase tracking-wider text-ink-500">
                      {group.icon} {group.title}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {group.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            to={item.href}
                            onClick={closeMenu}
                            className="block rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-surface"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <NavLink to="/courses" onClick={closeMenu} className={mobileNavLinkClass}>
              {t("nav.courses")}
            </NavLink>
            <NavLink to="/planning" onClick={closeMenu} className={mobileNavLinkClass}>
              {t("nav.planning")}
            </NavLink>
            <NavLink to="/coaches" onClick={closeMenu} className={mobileNavLinkClass}>
              {t("nav.coaches")}
            </NavLink>
            <NavLink to="/plans" onClick={closeMenu} className={mobileNavLinkClass}>
              {t("nav.plans")}
            </NavLink>
          </nav>
          <div className="mt-3 space-y-1 border-t border-ink-200 pt-3">
            {user ? (
              <>
                {user.role === "admin" && (
                  <NavLink
                    to="/admin"
                    onClick={closeMenu}
                    className="block rounded-md bg-red-600 px-4 py-2 text-base font-medium text-white"
                  >
                    Admin
                  </NavLink>
                )}
                {user.role === "coach" && (
                  <NavLink
                    to="/coach"
                    onClick={closeMenu}
                    className="block rounded-md bg-emerald-600 px-4 py-2 text-base font-medium text-white"
                  >
                    Coach
                  </NavLink>
                )}
                <NavLink
                  to="/dashboard"
                  onClick={closeMenu}
                  className={mobileNavLinkClass}
                >
                  {t("nav.dashboard")}
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-md px-4 py-2 text-left text-base font-medium text-ink-700 hover:bg-ink-100"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className={mobileNavLinkClass}
                >
                  {t("nav.login")}
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={closeMenu}
                  className="block rounded-md bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-2 text-base font-medium text-white"
                >
                  {t("nav.register")}
                </NavLink>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                toggleLang();
                closeMenu();
              }}
              className="block w-full rounded-md border border-ink-200 px-4 py-2 text-left text-sm text-ink-700 hover:bg-ink-100"
            >
              Langue : {i18n.language.startsWith("fr") ? "FR" : "EN"} →{" "}
              {i18n.language.startsWith("fr") ? "EN" : "FR"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
