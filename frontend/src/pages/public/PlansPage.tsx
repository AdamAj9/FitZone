import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";


import { paymentsApi } from "../../api/payments";
import { subscriptionsApi } from "../../api/subscriptions";
import { useAuthStore } from "../../store/auth";
import type { Period } from "../../types/subscriptions";

export function PlansPage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>("monthly");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);


  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: () => subscriptionsApi.listPlans(),
  });

  const currentQuery = useQuery({
    queryKey: ["subscription-current"],
    queryFn: () => subscriptionsApi.current(),
    enabled: Boolean(user),
  });

const checkoutMutation = useMutation({
    mutationFn: (planId: number) => paymentsApi.checkoutSubscription(planId),
    onSuccess: ({ checkout_url }) => {
      window.location.href = checkout_url;
    },
  });

  const filteredPlans =
    plansQuery.data?.results.filter((p) => p.period === period) ?? [];

  const currentSub = currentQuery.data?.subscription ?? null;
 const apiError = checkoutMutation.error as
    | { response?: { data?: { detail?: string } } }
    | null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-surface p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">{t("plans.title")}</h1>
        <p className="mt-2 text-slate-600">
          {t("plans.subtitle")}
        </p>

        <div className="mt-6 inline-flex rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              period === "monthly"
                ? "bg-surface text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            {t("home.periodMonthly")}
          </button>
          <button
            type="button"
            onClick={() => setPeriod("yearly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              period === "yearly"
                ? "bg-surface text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            {t("home.periodYearly")} <span className="ml-1 text-xs text-brand-600">{t("home.yearlyDiscount")}</span>
          </button>
        </div>
      </div>

      {currentSub && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
          {t("plans.activeSubscription")}{" "}
          <strong>{currentSub.plan.name}</strong> —{" "}
          {t("plans.daysRemaining", { count: currentSub.days_remaining })}
        </div>
      )}

      {apiError?.response?.data?.detail && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {apiError.response.data.detail}
        </div>
      )}

      {plansQuery.isLoading ? (
        <p className="text-slate-500">{t("common.loading")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPlans.map((plan) => {
            const isPremium = plan.tier === "premium";
            return (
              <div
                key={plan.id}
                className={`rounded-2xl bg-surface p-6 shadow-sm ring-1 ${
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
                      {t("home.recommended")}
                    </span>
                  )}
                </div>

                <p className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">
                    {Number(plan.price).toFixed(0)}
                  </span>
                  <span className="text-slate-500">
                    {" €"} / {plan.period === "monthly" ? t("home.perMonth") : t("home.perYear")}
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
                    checkoutMutation.mutate(plan.id);
                  }}
                  disabled={checkoutMutation.isPending || Boolean(currentSub)}
                  className={`mt-6 w-full rounded-md px-4 py-3 font-medium transition ${
                    isPremium
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {currentSub
                    ? t("plans.alreadyActive")
                    : checkoutMutation.isPending &&
                        checkoutMutation.variables === plan.id
                      ? t("plans.subscribing")
                      : user
                        ? t("home.subscribe")
                        : t("plans.loginToSubscribe")}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
