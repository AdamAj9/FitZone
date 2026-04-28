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

export function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();

  const toggleLang = () => {
    void i18n.changeLanguage(i18n.language.startsWith("fr") ? "en" : "fr");
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate("/", { replace: true }),
    });
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-brand-600">
          {t("app.name")}
        </Link>

        <nav className="flex items-center gap-1">
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

        <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
}
