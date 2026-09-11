import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { useLogin } from "../../hooks/useAuth";
import {
  AuthField,
  AuthShell,
  authInputClass,
  authSubmitClass,
} from "./AuthShell";

type FormValues = {
  email: string;
  password: string;
};

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  const login = useLogin();

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("auth.validation.emailInvalid")),
        password: z.string().min(1, t("auth.validation.passwordRequired")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    login.mutate(values, {
      onSuccess: (data) => {
        const roleHome =
          data.user.role === "admin"
            ? "/admin"
            : data.user.role === "coach"
              ? "/coach"
              : "/dashboard";
        navigate(location.state?.from?.pathname ?? roleHome, { replace: true });
      },
    });
  };

  const apiError = login.error as
    | { response?: { data?: { detail?: string } } }
    | null;

  return (
    <AuthShell
      title={t("nav.login")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link
            to="/register"
            className="font-medium text-volt-400 transition hover:text-volt-300"
          >
            {t("nav.register")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <AuthField label={t("auth.fields.email")} error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className={authInputClass}
          />
        </AuthField>

        <AuthField
          label={t("auth.fields.password")}
          error={errors.password?.message}
        >
          <input
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className={authInputClass}
          />
        </AuthField>

        {apiError?.response?.data?.detail && (
          <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {apiError.response.data.detail}
          </p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className={`${authSubmitClass} !mt-6`}
        >
          {login.isPending ? t("common.loading") : t("nav.login")}
        </button>
      </form>
    </AuthShell>
  );
}
