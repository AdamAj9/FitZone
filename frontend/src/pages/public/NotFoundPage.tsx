import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
      <h1 className="text-6xl font-bold text-slate-900">404</h1>
      <p className="mt-4 text-slate-600">Page introuvable / Page not found</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-2 font-medium text-white hover:bg-brand-700"
      >
        ← Home
      </Link>
    </div>
  );
}
