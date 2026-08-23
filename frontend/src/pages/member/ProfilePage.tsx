import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { authApi } from "../../api/auth";
import { PasswordRequirements } from "../../components/ui";
import { useChangePassword, useMe } from "../../hooks/useAuth";

interface FormValues {
  first_name: string;
  last_name: string;
  phone: string;
  preferred_language: "fr" | "en";
}

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

export function ProfilePage() {
  const { t } = useTranslation();
  const { data: user, isLoading } = useMe();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      preferred_language: "fr",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        preferred_language: user.preferred_language,
      });
    }
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => authApi.updateMe(values),
    onSuccess: (data) => queryClient.setQueryData(["me"], data),
  });

  const passwordSchema = useMemo(
    () =>
      z
        .object({
          current_password: z.string().min(1, t("auth.validation.passwordRequired")),
          new_password: z
            .string()
            .min(8, t("auth.validation.passwordMinLength"))
            .regex(/[a-zA-Z]/, t("auth.validation.passwordNeedsLetter"))
            .regex(/\d/, t("auth.validation.passwordNeedsDigit")),
          new_password_confirm: z.string(),
        })
        .refine((d) => d.new_password === d.new_password_confirm, {
          message: t("auth.validation.passwordMismatch"),
          path: ["new_password_confirm"],
        }),
    [t],
  );

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const newPassword = watchPassword("new_password") ?? "";
  const newPasswordConfirm = watchPassword("new_password_confirm") ?? "";

  const changePasswordMutation = useChangePassword();

  const onChangePassword = (values: PasswordFormValues) => {
    changePasswordMutation.mutate(values, {
      onSuccess: () => resetPasswordForm(),
    });
  };

  const passwordApiError = changePasswordMutation.error as
    | { response?: { data?: Record<string, string[] | string> } }
    | null;

  if (isLoading || !user) {
    return <p className="text-slate-500">{t("common.loading")}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{t("profile.title")}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.email} · <span className="font-medium">{user.role}</span>
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) => updateMutation.mutate(v))}
        className="space-y-4 rounded-2xl bg-surface p-6 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("auth.fields.firstName")}
            </label>
            <input
              {...register("first_name")}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">{t("auth.fields.lastName")}</label>
            <input
              {...register("last_name")}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t("profile.phone")}
          </label>
          <input
            {...register("phone")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t("profile.preferredLanguage")}
          </label>
          <select
            {...register("preferred_language")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="fr">{t("profile.langFrench")}</option>
            <option value="en">{t("profile.langEnglish")}</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={!formState.isDirty || updateMutation.isPending}
            className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? t("profile.saving") : t("profile.save")}
          </button>
          {updateMutation.isSuccess && (
            <span className="text-sm text-green-600">{t("profile.updated")}</span>
          )}
        </div>
      </form>

      <form
        onSubmit={handlePasswordSubmit(onChangePassword)}
        className="space-y-4 rounded-2xl bg-surface p-6 shadow-sm"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t("profile.changePasswordTitle")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("profile.changePasswordSubtitle")}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t("profile.currentPassword")}
          </label>
          <input
            type="password"
            autoComplete="current-password"
            {...registerPassword("current_password")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
          {passwordErrors.current_password && (
            <p className="mt-1 text-sm text-red-600">
              {passwordErrors.current_password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t("profile.newPassword")}
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...registerPassword("new_password")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
          {passwordErrors.new_password && (
            <p className="mt-1 text-sm text-red-600">
              {passwordErrors.new_password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t("profile.newPasswordConfirm")}
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...registerPassword("new_password_confirm")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
          {passwordErrors.new_password_confirm && (
            <p className="mt-1 text-sm text-red-600">
              {passwordErrors.new_password_confirm.message}
            </p>
          )}
        </div>

        <PasswordRequirements password={newPassword} confirmPassword={newPasswordConfirm} />

        {passwordApiError?.response?.data && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {Object.entries(passwordApiError.response.data).map(([key, val]) => (
              <p key={key}>{Array.isArray(val) ? val.join(", ") : String(val)}</p>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {changePasswordMutation.isPending
              ? t("profile.saving")
              : t("profile.changePasswordSubmit")}
          </button>
          {changePasswordMutation.isSuccess && (
            <span className="text-sm text-green-600">
              {t("profile.passwordUpdated")}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
