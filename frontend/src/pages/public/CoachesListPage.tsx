import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { coursesApi } from "../../api/courses";
import { CoachPortrait } from "../../components/CoachPortrait";
import { StarRating } from "../../components/StarRating";
import { EmptyState, Reveal, SkeletonCard, TiltCard } from "../../components/ui";

export function CoachesListPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["coaches"],
    queryFn: () => coursesApi.listCoaches(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <h1 className="font-display text-3xl font-bold text-slate-900">{t("coaches.title")}</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title={t("coaches.loadErrorTitle")}
        description={t("coaches.loadErrorDescription")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Reveal className="rounded-2xl bg-surface p-6 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-slate-900">{t("coaches.title")}</h1>
        <p className="mt-1 text-slate-600">
          {t("coaches.subtitle")}
        </p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.results.map((coach, index) => (
          <Reveal key={coach.id} delay={Math.min(index, 6) * 80}>
            <TiltCard>
              <Link
                to={`/coaches/${coach.id}`}
                className="group block overflow-hidden rounded-2xl border border-char-800 bg-char-900/60 backdrop-blur-xl transition hover:-translate-y-1 hover:border-volt-400/50 hover:shadow-volt-glow"
              >
                <div className="relative">
                  <CoachPortrait coach={coach} className="aspect-[4/5] w-full" />
                  {/* Name sits on the portrait, as the bento tiles do on the
                      home page, so the card leads with a face. */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-char-950 via-char-950/80 to-transparent p-4 pt-12">
                    <h3 className="font-display text-lg font-bold text-white">
                      {coach.full_name}
                    </h3>
                    {coach.coach_profile?.specialties && (
                      <p className="mt-0.5 text-sm text-char-200">
                        {coach.coach_profile.specialties}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <StarRating
                    value={coach.rating_average}
                    count={coach.rating_count}
                    size="sm"
                  />
                  {coach.coach_profile?.years_of_experience ? (
                    <p className="shrink-0 text-xs text-slate-500">
                      {t("coaches.yearsExperience", { count: coach.coach_profile.years_of_experience })}
                    </p>
                  ) : null}
                </div>
              </Link>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
