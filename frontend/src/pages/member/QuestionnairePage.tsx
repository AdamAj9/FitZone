import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { coursesApi } from "../../api/courses";
import { meApi } from "../../api/me";
import { useMe } from "../../hooks/useAuth";

const schema = z.object({
  level: z.enum(["beginner", "intermediate", "advanced"]),
  goals: z.string().max(500),
  favorite_categories: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

export function QuestionnairePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const [submitted, setSubmitted] = useState(false);

  const levelOptions = [
    { value: "beginner", label: t("common.levels.beginner"), hint: t("questionnaire.hintBeginner") },
    { value: "intermediate", label: t("common.levels.intermediate"), hint: t("questionnaire.hintIntermediate") },
    { value: "advanced", label: t("common.levels.advanced"), hint: t("questionnaire.hintAdvanced") },
  ] as const;

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => coursesApi.listCategories(),
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      level: user?.member_profile?.level ?? "beginner",
      goals: user?.member_profile?.goals ?? "",
      favorite_categories:
        (user?.member_profile?.preferences as
          | { categories?: string[] }
          | undefined)?.categories ?? [],
    },
  });

  const submitMutation = useMutation({
    mutationFn: (values: FormValues) => meApi.submitQuestionnaire(values),
    onSuccess: () => {
      setSubmitted(true);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      void queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      setTimeout(() => navigate("/dashboard"), 700);
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {t("questionnaire.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("questionnaire.subtitle")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) => submitMutation.mutate(v))}
        className="space-y-6 rounded-2xl bg-surface p-6 shadow-sm"
      >
        <fieldset>
          <legend className="text-sm font-medium text-slate-700">
            {t("questionnaire.levelQuestion")}
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {levelOptions.map((opt) => (
              <label
                key={opt.value}
                className="cursor-pointer rounded-lg border border-slate-200 p-3 text-sm hover:border-brand-400 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
              >
                <input
                  type="radio"
                  value={opt.value}
                  {...register("level")}
                  className="sr-only"
                />
                <p className="font-medium text-slate-900">{opt.label}</p>
                <p className="mt-1 text-xs text-slate-500">{opt.hint}</p>
              </label>
            ))}
          </div>
          {errors.level && (
            <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
          )}
        </fieldset>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t("questionnaire.goalsLabel")}
          </label>
          <textarea
            {...register("goals")}
            rows={3}
            placeholder={t("questionnaire.goalsPlaceholder")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-slate-700">
            {t("questionnaire.categoriesLabel")}
          </legend>
          <Controller
            control={control}
            name="favorite_categories"
            render={({ field }) => (
              <div className="mt-3 flex flex-wrap gap-2">
                {categoriesQuery.data?.results.map((c) => {
                  const checked = field.value.includes(c.slug);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          checked
                            ? field.value.filter((s) => s !== c.slug)
                            : [...field.value, c.slug],
                        )
                      }
                      className={`rounded-full px-3 py-1.5 text-sm transition ${
                        checked
                          ? "bg-brand-600 text-white"
                          : "border border-slate-300 text-slate-700 hover:border-brand-400"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </fieldset>

        <div className="flex items-center justify-end gap-3">
          {submitted && (
            <span className="text-sm text-green-600">
              ✓ {t("questionnaire.saved")}
            </span>
          )}
          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="rounded-md bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {submitMutation.isPending ? t("profile.saving") : t("questionnaire.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
