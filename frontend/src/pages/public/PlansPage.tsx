import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { subscriptionsApi } from "../../api/subscriptions";
import { useAuthStore } from "../../store/auth";
import type { Period } from "../../types/subscriptions";

export function PlansPage() {
  const [period, setPeriod] = useState<Period>("monthly");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: () => subscriptionsApi.listPlans(),
  });

  const currentQuery = useQuery({
    queryKey: ["subscription-current"],
    queryFn: () => subscriptionsApi.current(),
    enabled: Boolean(user),
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId: number) => subscriptionsApi.subscribe(planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["subscription-current"] });
      void queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
      navigate("/my-subscription", { replace: true });
    },
  });

  const filteredPlans =
    plansQuery.data?.results.filter((p) => p.period === period) ?? [];

  const currentSub = currentQuery.data?.subscription ?? null;
  const apiError = subscribeMutation.error as
    | { response?: { data?: { detail?: string } } }
    | null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Nos abonnements</h1>
        <p className="mt-2 text-slate-600">
          Choisissez la formule qui vous correspond.
        </p>

        <div className="mt-6 inline-flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              period === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setPeriod("yearly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              period === "yearly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            Annuel <span className="ml-1 text-xs text-brand-600">−2 mois</span>
          </button>
        </div>
      </div>

      {currentSub && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
          Vous avez déjà un abonnement actif :{" "}
          <strong>{currentSub.plan.name}</strong> — il vous reste{" "}
          {currentSub.days_remaining} jours.
        </div>
      )}

      {apiError?.response?.data?.detail && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {apiError.response.data.detail}
        </div>
      )}

      {plansQuery.isLoading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPlans.map((plan) => {
            const isPremium = plan.tier === "premium";
            return (
              <div
                key={plan.id}
                className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ${
                  isPremium ? "ring-brand-500" : "ring-slate-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wide ${
                        isPremium ? "text-brand-600" : "text-slate-500"
                      }`}
                    >
                      {plan.tier_display}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      {plan.name}
                    </h2>
                  </div>
                  {isPremium && (
                    <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-medium text-brand-700">
                      Recommandé
                    </span>
                  )}
                </div>

                <p className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">
                    {Number(plan.price).toFixed(0)}
                  </span>
                  <span className="text-slate-500">
                    {" €"} / {plan.period === "monthly" ? "mois" : "an"}
                  </span>
                </p>

                <p className="mt-2 text-sm text-slate-600">{plan.description}</p>

                <ul className="mt-5 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-slate-700">
                      <span className="mt-0.5 text-brand-600">✓</span> {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      navigate("/login");
                      return;
                    }
                    subscribeMutation.mutate(plan.id);
                  }}
                  disabled={
                    subscribeMutation.isPending || Boolean(currentSub)
                  }
                  className={`mt-6 w-full rounded-md px-4 py-3 font-medium transition ${
                    isPremium
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {currentSub
                    ? "Abonnement déjà actif"
                    : subscribeMutation.isPending &&
                        subscribeMutation.variables === plan.id
                      ? "Souscription..."
                      : user
                        ? "Souscrire"
                        : "Se connecter pour souscrire"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
