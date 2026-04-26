import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { bookingsApi } from "../../api/bookings";
import { subscriptionsApi } from "../../api/subscriptions";
import { useMe } from "../../hooks/useAuth";

export function DashboardPage() {
  const { data: user, isLoading } = useMe();
  const subQuery = useQuery({
    queryKey: ["subscription-current"],
    queryFn: () => subscriptionsApi.current(),
    enabled: Boolean(user),
  });
  const bookingsQuery = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => bookingsApi.listMine(),
    enabled: Boolean(user),
  });

  if (isLoading || !user) {
    return <p className="text-slate-500">Chargement...</p>;
  }

  const sub = subQuery.data?.subscription ?? null;
  const upcoming =
    bookingsQuery.data?.results.filter(
      (b) => b.status === "confirmed" && new Date(b.starts_at) > new Date(),
    ) ?? [];

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/profile"
          className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">Mon profil</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gérer mes informations
          </p>
        </Link>
        <Link
          to="/my-subscription"
          className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">Mon abonnement</h2>
          {sub ? (
            <p className="mt-1 text-sm text-slate-500">
              {sub.plan.name} · {sub.days_remaining}j restants
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              Aucun abonnement actif
            </p>
          )}
        </Link>
        <Link
          to="/my-bookings"
          className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">Mes réservations</h2>
          <p className="mt-1 text-sm text-slate-500">
            {upcoming.length === 0
              ? "Aucune séance à venir"
              : `${upcoming.length} séance${upcoming.length > 1 ? "s" : ""} à venir`}
          </p>
        </Link>
        <Link
          to="/my-payments"
          className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-semibold text-slate-900">Mes paiements</h2>
          <p className="mt-1 text-sm text-slate-500">
            Historique Stripe
          </p>
        </Link>
      </div>
    </div>
  );
}
