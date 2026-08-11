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
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-8">
        <aside className="w-56 shrink-0 space-y-1">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Administration
          </p>
          <NavLink to="/admin" end className={navItem}>
            Tableau de bord
          </NavLink>
          <NavLink to="/admin/users" className={navItem}>
            Utilisateurs
          </NavLink>
          <NavLink to="/admin/logs" className={navItem}>
            Journal d'audit
          </NavLink>
          <NavLink to="/admin/payments" className={navItem}>
            Paiements
          </NavLink>
          <NavLink to="/admin/subscriptions" className={navItem}>
            Abonnements
          </NavLink>
          <div className="mt-6 rounded-md bg-slate-100 p-3 text-xs text-slate-600">
            <p className="font-medium text-slate-900">Connecté en admin</p>
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
