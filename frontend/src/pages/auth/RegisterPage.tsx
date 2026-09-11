import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { PasswordRequirements } from "../../components/ui";
import { useRegister } from "../../hooks/useAuth";
import {
  AuthField,
  AuthShell,
  authInputClass,
  authSubmitClass,
} from "./AuthShell";

type FormValues = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
};

export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const schema = useMemo(
    () =>
      z
        .object({
          email: z.string().email(t("auth.validation.emailInvalid")),
          first_name: z.string().min(1, t("auth.validation.firstNameRequired")),
          last_name: z.string().min(1, t("auth.validation.lastNameRequired")),
          password: z
            .string()
            .min(8, t("auth.validation.passwordMinLength"))
            .regex(/[a-zA-Z]/, t("auth.validation.passwordNeedsLetter"))
            .regex(/\d/, t("auth.validation.passwordNeedsDigit")),
          password_confirm: z.string(),
        })
        .refine((d) => d.password === d.password_confirm, {
          message: t("auth.validation.passwordMismatch"),
          path: ["password_confirm"],
        }),
    [t],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const password = watch("password") ?? "";
  const passwordConfirm = watch("password_confirm") ?? "";

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
    <AuthShell
      title={t("nav.register")}
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <Link
            to="/login"
            className="font-medium text-volt-400 transition hover:text-volt-300"
          >
            {t("nav.login")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <AuthField
            label={t("auth.fields.firstName")}
            error={errors.first_name?.message}
          >
            <input {...register("first_name")} className={authInputClass} />
          </AuthField>
          <AuthField
            label={t("auth.fields.lastName")}
            error={errors.last_name?.message}
          >
            <input {...register("last_name")} className={authInputClass} />
          </AuthField>
        </div>

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
            autoComplete="new-password"
            {...register("password")}
            className={authInputClass}
          />
        </AuthField>

        <AuthField
          label={t("auth.fields.confirmPassword")}
          error={errors.password_confirm?.message}
        >
          <input
            type="password"
            autoComplete="new-password"
            {...register("password_confirm")}
            className={authInputClass}
          />
        </AuthField>

        <PasswordRequirements password={password} confirmPassword={passwordConfirm} />

        {apiError?.response?.data && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
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
          className={`${authSubmitClass} !mt-6`}
        >
          {registerMutation.isPending
            ? t("common.loading")
            : t("nav.register")}
        </button>
      </form>
    </AuthShell>
  );
}
