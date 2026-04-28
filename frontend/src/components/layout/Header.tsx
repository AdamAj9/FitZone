import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useLogout } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/auth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    isActive
      ? "text-brand-600 bg-brand-50"
      : "text-slate-600 hover:text-brand-600 hover:bg-slate-100"
  }`;

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2 text-base font-medium rounded-md ${
    isActive
      ? "text-brand-600 bg-brand-50"
      : "text-slate-700 hover:bg-slate-100"
  }`;

export function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

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
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-xl font-bold text-brand-600" onClick={closeMenu}>
          {t("app.name")}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" end className={navLinkClass}>
            {t("nav.home")}
          </NavLink>
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
            className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
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
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
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
                className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
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
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
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
        <div className="border-t bg-white px-3 py-3 lg:hidden">
          <nav className="space-y-1">
            <NavLink to="/" end onClick={closeMenu} className={mobileNavLinkClass}>
              {t("nav.home")}
            </NavLink>
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
          <div className="mt-3 space-y-1 border-t pt-3">
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
                  className="block w-full rounded-md px-4 py-2 text-left text-base font-medium text-slate-700 hover:bg-slate-100"
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
                  className="block rounded-md bg-brand-600 px-4 py-2 text-base font-medium text-white"
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
              className="block w-full rounded-md border border-slate-200 px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
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
