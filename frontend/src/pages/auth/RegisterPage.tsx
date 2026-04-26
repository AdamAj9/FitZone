import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { useRegister } from "../../hooks/useAuth";

const schema = z
  .object({
    email: z.string().email("Email invalide"),
    first_name: z.string().min(1, "Prénom requis"),
    last_name: z.string().min(1, "Nom requis"),
    password: z.string().min(8, "8 caractères minimum"),
    password_confirm: z.string(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirm"],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    registerMutation.mutate(
      {
        ...values,
        preferred_language: i18n.language.startsWith("fr") ? "fr" : "en",
      },
      { onSuccess: () => navigate("/dashboard", { replace: true }) },
    );
  };

  const apiError = registerMutation.error as
    | { response?: { data?: Record<string, string[] | string> } }
    | null;

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{t("nav.register")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Prénom
            </label>
            <input
              {...register("first_name")}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.first_name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nom</label>
            <input
              {...register("last_name")}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
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
            autoComplete="new-password"
            {...register("password")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Confirmer
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...register("password_confirm")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
          {errors.password_confirm && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password_confirm.message}
            </p>
          )}
        </div>

        {apiError?.response?.data && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {Object.entries(apiError.response.data).map(([key, val]) => (
              <p key={key}>
                <strong>{key}:</strong>{" "}
                {Array.isArray(val) ? val.join(", ") : String(val)}
              </p>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {registerMutation.isPending
            ? t("common.loading")
            : t("nav.register")}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link to="/login" className="text-brand-600 hover:underline">
          {t("nav.login")}
        </Link>
      </p>
    </div>
  );
}
