import { Link } from "react-router-dom";

export function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-surface p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
        ⚠
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Paiement annulé
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Votre paiement n'a pas été finalisé. Vous pouvez recommencer à tout
        moment.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/plans"
          className="rounded-md bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700"
        >
          Retour aux abonnements
        </Link>
        <Link
          to="/dashboard"
          className="rounded-md border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Tableau de bord
        </Link>
      </div>
    </div>
  );
}
