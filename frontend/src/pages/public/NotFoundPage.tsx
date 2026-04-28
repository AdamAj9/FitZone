import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-surface p-12 text-center shadow-sm">
      <p className="text-7xl">🤷</p>
      <h1 className="mt-4 text-5xl font-bold text-slate-900">404</h1>
      <p className="mt-3 text-slate-600">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/"
          className="rounded-md bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700"
        >
          Retour à l'accueil
        </Link>
        <Link
          to="/courses"
          className="rounded-md border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Voir les cours
        </Link>
      </div>
    </div>
  );
}
