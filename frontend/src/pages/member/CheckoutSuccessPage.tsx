import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { subscriptionsApi } from "../../api/subscriptions";

export function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const queryClient = useQueryClient();

  const currentQuery = useQuery({
    queryKey: ["subscription-current"],
    queryFn: () => subscriptionsApi.current(),
    refetchInterval: (q) =>
      q.state.data?.subscription?.status === "active" ? false : 1500,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
    void queryClient.invalidateQueries({ queryKey: ["my-payments"] });
  }, [queryClient]);

  const sub = currentQuery.data?.subscription ?? null;
  const isActive = sub?.status === "active";

  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
        ✓
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Paiement confirmé
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {isActive
          ? "Votre abonnement est désormais actif."
          : "Nous attendons la confirmation de Stripe — un instant…"}
      </p>
      {sessionId && (
        <p className="mt-3 break-all rounded-md bg-slate-50 p-2 font-mono text-xs text-slate-500">
          Session : {sessionId}
        </p>
      )}
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/my-subscription"
          className="rounded-md bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700"
        >
          Mon abonnement
        </Link>
        <Link
          to="/my-payments"
          className="rounded-md border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Mes paiements
        </Link>
      </div>
    </div>
  );
}
