import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function HomePage() {
  const { t } = useTranslation();
  return (
    <section className="rounded-2xl bg-white p-12 text-center shadow-sm">
      <h1 className="text-4xl font-bold text-slate-900">{t("home.hero")}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
        {t("home.subtitle")}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/register"
          className="rounded-md bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
        >
          {t("nav.register")}
        </Link>
        <Link
          to="/courses"
          className="rounded-md border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          {t("nav.courses")}
        </Link>
      </div>
    </section>
  );
}
