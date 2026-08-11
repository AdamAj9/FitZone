import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";

import { useAuthStore } from "../../store/auth";
import { Footer } from "./Footer";
import { Header } from "./Header";

const navItem = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-brand-600 text-white"
      : "text-slate-700 hover:bg-slate-100"
  }`;

export function AdminLayout() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-8">
        <aside className="w-56 shrink-0 space-y-1">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            {t("adminLayout.title")}
          </p>
          <NavLink to="/admin" end className={navItem}>
            {t("coachDashboard.title")}
          </NavLink>
          <NavLink to="/admin/users" className={navItem}>
            {t("adminUsers.title")}
          </NavLink>
          <NavLink to="/admin/logs" className={navItem}>
            {t("adminLogs.title")}
          </NavLink>
          <NavLink to="/admin/payments" className={navItem}>
            {t("myPayments.title")}
          </NavLink>
          <NavLink to="/admin/subscriptions" className={navItem}>
            {t("nav.plans")}
          </NavLink>
          <div className="mt-6 rounded-md bg-slate-100 p-3 text-xs text-slate-600">
            <p className="font-medium text-slate-900">{t("adminLayout.loggedInAs")}</p>
            <p className="mt-1 truncate">{user?.email}</p>
          </div>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
