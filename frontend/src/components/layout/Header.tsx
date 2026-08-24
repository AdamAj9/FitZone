import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { OFFERINGS } from "../../data/offerings";
import { useLogout } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/auth";

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "nl", label: "Nederlands" },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    isActive
      ? "text-volt-400"
      : "text-char-200 hover:text-volt-400"
  }`;

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2 text-base font-medium rounded-md ${
    isActive
      ? "text-volt-400 bg-white/5"
      : "text-char-200 hover:bg-white/5"
  }`;

export function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();
  const [open, setOpen] = useState(false);
  const [mobileOfferOpen, setMobileOfferOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setOpen(false);
    setMobileOfferOpen(false);
  };

  const currentLang =
    LANGUAGES.find((l) => i18n.language.startsWith(l.code)) ?? LANGUAGES[0];

  const selectLang = (code: string) => {
    void i18n.changeLanguage(code);
    setLangMenuOpen(false);
  };

  useEffect(() => {
    if (!langMenuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!langMenuRef.current?.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [langMenuOpen]);

  const handleLogout = () => {
    closeMenu();
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate("/", { replace: true }),
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-char-800 bg-char-950/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold"
          onClick={closeMenu}
        >
          <img src="/images/logo-volt.png" alt="FitZone" className="h-16 w-auto object-contain" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" end className={navLinkClass}>
            {t("nav.home")}
          </NavLink>

          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-char-200 hover:text-volt-400"
            >
              {t("header.ourOffer")}
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
              <div className="w-[920px] overflow-hidden rounded-2xl border border-char-800 bg-char-900 shadow-2xl">
                <div className="grid grid-cols-3 gap-6 p-6">
                  {OFFERINGS.map((group) => (
                    <Link
                      key={group.key}
                      to={group.items[0]?.href ?? "/courses"}
                      className="group/item relative overflow-hidden rounded-xl border border-char-700 bg-char-850 transition hover:border-volt-400/60 hover:shadow-volt-glow"
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={group.image}
                          alt={t(`offerings.${group.key}.title`)}
                          className="h-full w-full object-cover grayscale-[15%] transition-transform duration-500 group-hover/item:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-char-950/90 via-char-950/30 to-transparent" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                        <p className="flex items-center gap-1.5 text-sm font-semibold">
                          <span>{group.icon}</span>
                          {t(`offerings.${group.key}.title`)}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-char-300">
                          {group.items
                            .map((i) => t(`offerings.${group.key}.items.${i.key}.label`))
                            .join(" · ")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-char-800 bg-char-950 px-6 py-4 text-white">
                  <div>
                    <p className="text-sm font-semibold">
                      {t("header.discoverFitZone")}
                    </p>
                    <p className="text-xs text-char-400">
                      {t("header.discoverFitZoneSubtitle")}
                    </p>
                  </div>
                  <Link
                    to="/plans"
                    className="rounded-md bg-volt-400 px-4 py-2 text-sm font-semibold text-char-950 transition hover:bg-volt-300"
                  >
                    {t("home.offerSeeAll")} →
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
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen((v) => !v)}
              aria-expanded={langMenuOpen}
              aria-label={t("header.language")}
              className="flex items-center gap-1 rounded-md border border-char-700 px-2 py-1 text-xs font-medium text-char-200 hover:border-volt-400/50 hover:text-volt-400"
            >
              {currentLang.code.toUpperCase()}
              <svg
                className={`h-3 w-3 transition-transform ${langMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-md border border-char-700 bg-char-900 py-1 shadow-lg">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => selectLang(l.code)}
                    className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-white/5 ${
                      l.code === currentLang.code
                        ? "font-semibold text-volt-400"
                        : "text-char-200"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {user ? (
            <>
              {user.role === "admin" && (
                <NavLink
                  to="/admin"
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  {t("header.adminBadge")}
                </NavLink>
              )}
              {user.role === "coach" && (
                <NavLink
                  to="/coach"
                  className="rounded-md bg-ember-600 px-3 py-2 text-sm font-medium text-white hover:bg-ember-700"
                >
                  {t("header.coachBadge")}
                </NavLink>
              )}
              {user.role === "member" && (
                <NavLink to="/dashboard" className={navLinkClass}>
                  {t("nav.dashboard")}
                </NavLink>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="rounded-md px-3 py-2 text-sm font-medium text-char-200 hover:text-volt-400 disabled:opacity-50"
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
                className="rounded-md bg-volt-ember px-4 py-2 text-sm font-bold text-char-950 shadow-volt-glow transition hover:opacity-90 active:scale-[0.97]"
              >
                {t("nav.register")}
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? t("header.closeMenu") : t("header.openMenu")}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-char-200 hover:bg-white/5 lg:hidden"
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
        <div className="border-t border-char-800 bg-char-950 px-3 py-3 lg:hidden">
          <nav className="space-y-1">
            <NavLink to="/" end onClick={closeMenu} className={mobileNavLinkClass}>
              {t("nav.home")}
            </NavLink>

            <button
              type="button"
              onClick={() => setMobileOfferOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-md px-4 py-2 text-base font-medium text-char-200 hover:bg-white/5"
            >
              {t("header.ourOffer")}
              <span
                className={`transition-transform ${
                  mobileOfferOpen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            {mobileOfferOpen && (
              <div className="rounded-md bg-char-900 p-3">
                {OFFERINGS.map((group) => (
                  <div key={group.key} className="mb-4 last:mb-0">
                    <p className="px-2 text-xs font-bold uppercase tracking-wider text-char-400">
                      {group.icon} {t(`offerings.${group.key}.title`)}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {group.items.map((item) => (
                        <li key={item.key}>
                          <Link
                            to={item.href}
                            onClick={closeMenu}
                            className="block rounded-md px-2 py-1.5 text-sm text-char-200 hover:bg-white/5"
                          >
                            {t(`offerings.${group.key}.items.${item.key}.label`)}
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
          <div className="mt-3 space-y-1 border-t border-char-800 pt-3">
            {user ? (
              <>
                {user.role === "admin" && (
                  <NavLink
                    to="/admin"
                    onClick={closeMenu}
                    className="block rounded-md bg-red-600 px-4 py-2 text-base font-medium text-white"
                  >
                    {t("header.adminBadge")}
                  </NavLink>
                )}
                {user.role === "coach" && (
                  <NavLink
                    to="/coach"
                    onClick={closeMenu}
                    className="block rounded-md bg-ember-600 px-4 py-2 text-base font-medium text-white"
                  >
                    {t("header.coachBadge")}
                  </NavLink>
                )}
                {user.role === "member" && (
                  <NavLink
                    to="/dashboard"
                    onClick={closeMenu}
                    className={mobileNavLinkClass}
                  >
                    {t("nav.dashboard")}
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-md px-4 py-2 text-left text-base font-medium text-char-200 hover:bg-white/5"
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
                  className="block rounded-md bg-volt-ember px-4 py-2 text-base font-bold text-char-950"
                >
                  {t("nav.register")}
                </NavLink>
              </>
            )}
            <div>
              <p className="px-4 pb-1.5 text-xs font-medium text-char-400">
                {t("header.language")}
              </p>
              <div className="flex gap-2 px-4">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      selectLang(l.code);
                      closeMenu();
                    }}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                      l.code === currentLang.code
                        ? "border-volt-400 bg-volt-400/10 text-volt-400"
                        : "border-char-700 text-char-200 hover:bg-white/5"
                    }`}
                  >
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
