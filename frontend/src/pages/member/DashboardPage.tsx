import { Link } from "react-router-dom";

import { useMe } from "../../hooks/useAuth";

export function DashboardPage() {
  const { data: user, isLoading } = useMe();

  if (isLoading || !user) {
    return <p className="text-slate-500">Chargement...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Bonjour {user.first_name || user.email} 👋
        </h1>
        <p className="mt-2 text-slate-600">
          Bienvenue sur votre tableau de bord FitZone.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/profile"
          className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">Mon profil</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gérer mes informations personnelles
          </p>
        </Link>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Mes cours</h2>
          <p className="mt-1 text-sm text-slate-500">À venir (Phase 6)</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Mon abonnement</h2>
          <p className="mt-1 text-sm text-slate-500">À venir (Phase 4)</p>
        </div>
      </div>
    </div>
  );
}
