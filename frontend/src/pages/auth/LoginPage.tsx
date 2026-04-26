import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { useLogin } from "../../hooks/useAuth";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    login.mutate(values, {
      onSuccess: () => {
        navigate(location.state?.from?.pathname ?? "/dashboard", { replace: true });
      },
    });
  };

  const apiError = login.error as
    | { response?: { data?: { detail?: string } } }
    | null;

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{t("nav.login")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Mot de passe
          </label>
          <input
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {apiError?.response?.data?.detail && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {apiError.response.data.detail}
          </p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {login.isPending ? t("common.loading") : t("nav.login")}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link to="/register" className="text-brand-600 hover:underline">
          {t("nav.register")}
        </Link>
      </p>
    </div>
  );
}
