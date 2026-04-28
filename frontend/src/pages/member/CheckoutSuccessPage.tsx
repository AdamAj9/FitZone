import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { paymentsApi } from "../../api/payments";

export function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const queryClient = useQueryClient();

  const verifyQuery = useQuery({
    queryKey: ["checkout-verify", sessionId],
    queryFn: () => paymentsApi.verifyCheckout(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: (q) =>
      q.state.data?.status === "succeeded" ? false : 1500,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (verifyQuery.data?.status === "succeeded") {
      void queryClient.invalidateQueries({ queryKey: ["subscription-current"] });
      void queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
      void queryClient.invalidateQueries({ queryKey: ["my-payments"] });
      void queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    }
  }, [verifyQuery.data?.status, queryClient]);

  const status = verifyQuery.data?.status;
  const isSuccess = status === "succeeded";
  const isFailed = status === "failed";

  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-surface p-8 text-center shadow-sm">
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
          isFailed
            ? "bg-red-100"
            : isSuccess
              ? "bg-green-100"
              : "bg-amber-100"
        }`}
      >
        {isFailed ? "✗" : isSuccess ? "✓" : "…"}
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        {isFailed
          ? "Paiement échoué"
          : isSuccess
            ? "Paiement confirmé"
            : "Vérification du paiement…"}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {isFailed
          ? "Le paiement n'a pas pu être validé. Vous pouvez réessayer."
          : isSuccess
            ? "Votre abonnement est désormais actif."
            : "Nous interrogeons Stripe — un instant…"}
      </p>
      {sessionId && (
        <p className="mt-3 break-all rounded-md bg-slate-50 p-2 font-mono text-xs text-slate-500">
          Session : {sessionId}
        </p>
      )}
      <div className="mt-6 flex justify-center gap-3">
        {isFailed ? (
          <Link
            to="/plans"
            className="rounded-md bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700"
          >
            Réessayer
          </Link>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
