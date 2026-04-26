import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { authApi } from "../../api/auth";
import { useMe } from "../../hooks/useAuth";

interface FormValues {
  first_name: string;
  last_name: string;
  phone: string;
  preferred_language: "fr" | "en";
}

export function ProfilePage() {
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

  if (isLoading || !user) {
    return <p className="text-slate-500">Chargement...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Mon profil</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.email} · <span className="font-medium">{user.role}</span>
        </p>
      </div>

      <form
        onSubmit={handleSubmit((v) => updateMutation.mutate(v))}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Prénom
            </label>
            <input
              {...register("first_name")}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nom</label>
            <input
              {...register("last_name")}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Téléphone
          </label>
          <input
            {...register("phone")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Langue préférée
          </label>
          <select
            {...register("preferred_language")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={!formState.isDirty || updateMutation.isPending}
            className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
          {updateMutation.isSuccess && (
            <span className="text-sm text-green-600">Profil mis à jour</span>
          )}
        </div>
      </form>
    </div>
  );
}
