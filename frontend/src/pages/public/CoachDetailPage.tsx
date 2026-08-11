import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { coursesApi } from "../../api/courses";
import { ratingsApi } from "../../api/ratings";
import { StarRating, StarRatingInput } from "../../components/StarRating";
import { useAuthStore } from "../../store/auth";
import { formatDateTime } from "../../lib/date";
import type { Rating } from "../../types/ratings";

function getResults(data: Rating[] | { results: Rating[] } | undefined): Rating[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results;
}

export function CoachDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const coachId = Number(id);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const coachQuery = useQuery({
    queryKey: ["coach", coachId],
    queryFn: () => coursesApi.getCoach(coachId),
    enabled: Number.isFinite(coachId),
  });

  const coursesQuery = useQuery({
    queryKey: ["courses-by-coach", coachId],
    queryFn: () => coursesApi.listCourses({ coach: coachId }),
    enabled: Number.isFinite(coachId),
  });

  const ratingsQuery = useQuery({
    queryKey: ["ratings", "coach", coachId],
    queryFn: () => ratingsApi.listForCoach(coachId),
    enabled: Number.isFinite(coachId),
  });

  const myRatingsQuery = useQuery({
    queryKey: ["ratings", "mine"],
    queryFn: () => ratingsApi.listMine(),
    enabled: Boolean(user),
  });

  const myRatingForThisCoach =
    getResults(myRatingsQuery.data).find((r) => r.coach === coachId) ?? null;

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (myRatingForThisCoach) {
      setScore(myRatingForThisCoach.score);
      setComment(myRatingForThisCoach.comment ?? "");
      setEditingId(myRatingForThisCoach.id);
    }
  }, [myRatingForThisCoach?.id]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["ratings", "coach", coachId] });
    void queryClient.invalidateQueries({ queryKey: ["ratings", "mine"] });
    void queryClient.invalidateQueries({ queryKey: ["coach", coachId] });
    void queryClient.invalidateQueries({ queryKey: ["coaches"] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      ratingsApi.create({ coach: coachId, score, comment }),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      ratingsApi.update(editingId!, { score, comment }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: () => ratingsApi.delete(editingId!),
    onSuccess: () => {
      setScore(0);
      setComment("");
      setEditingId(null);
      invalidate();
    },
  });

  if (coachQuery.isLoading) return <p className="text-slate-500">{t("common.loading")}</p>;
  if (coachQuery.isError || !coachQuery.data) {
    return (
      <div className="rounded-2xl bg-surface p-12 text-center shadow-sm">
        <p className="text-slate-500">{t("coachDetail.notFound")}</p>
        <Link to="/coaches" className="mt-4 inline-block text-brand-600 hover:underline">
          ← {t("coachDetail.backToList")}
        </Link>
      </div>
    );
  }

  const coach = coachQuery.data;
  const profile = coach.coach_profile;
  const coachCourses = coursesQuery.data?.results ?? [];
  const ratings = ratingsQuery.data?.results ?? [];

  const apiError = (createMutation.error ?? updateMutation.error) as
    | { response?: { data?: { detail?: string } } }
    | null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <aside className="space-y-4">
        <div className="rounded-2xl bg-surface p-6 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700">
            {coach.first_name.charAt(0)}
            {coach.last_name.charAt(0)}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {coach.full_name}
          </h1>
          {profile?.specialties && (
            <p className="mt-1 text-sm text-slate-500">{profile.specialties}</p>
          )}
          {profile?.years_of_experience ? (
            <p className="mt-2 text-xs text-slate-400">
              {t("coaches.yearsExperience", { count: profile.years_of_experience })}
            </p>
          ) : null}
          <div className="mt-4">
            <StarRating
              value={coach.rating_average}
              count={coach.rating_count}
              size="md"
            />
          </div>
        </div>

        {profile?.bio && (
          <div className="rounded-2xl bg-surface p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">{t("coachDetail.biography")}</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
              {profile.bio}
            </p>
          </div>
        )}
      </aside>

      <div className="lg:col-span-2 space-y-6">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            {t("coachDetail.coursesBy", { name: coach.first_name })}
          </h2>
          {coachCourses.length === 0 ? (
            <div className="rounded-2xl bg-surface p-8 text-center text-slate-500 shadow-sm">
              {t("coachDetail.noCourses")}
            </div>
          ) : (
            <div className="space-y-3">
              {coachCourses.map((c) => (
                <Link
                  key={c.id}
                  to={`/courses/${c.slug}`}
                  className="flex items-center justify-between rounded-xl bg-surface p-4 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <p className="font-medium text-slate-900">{c.title}</p>
                    <p className="text-sm text-slate-500">
                      {c.category} · {c.duration_minutes} min
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {Number(c.price_unit) > 0
                      ? `${Number(c.price_unit).toFixed(2)} €`
                      : t("coachDetail.included")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {user && (
          <section className="rounded-2xl bg-surface p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingId ? t("coachDetail.myReview") : t("coachDetail.leaveReview")}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {t("coachDetail.reviewRequirement")}
            </p>
            <div className="mt-4">
              <StarRatingInput value={score} onChange={setScore} />
            </div>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("coachDetail.commentPlaceholder")}
              className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            {apiError?.response?.data?.detail && (
              <p className="mt-2 text-sm text-red-600">
                {apiError.response.data.detail}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  editingId
                    ? updateMutation.mutate()
                    : createMutation.mutate()
                }
                disabled={
                  score === 0 ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {editingId ? t("coachDetail.update") : t("coachDetail.publishReview")}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {t("coachDetail.deleteReview")}
                </button>
              )}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            {t("coachDetail.reviewsCount", { count: coach.rating_count })}
          </h2>
          {ratings.length === 0 ? (
            <div className="rounded-2xl bg-surface p-8 text-center text-slate-500 shadow-sm">
              {t("coachDetail.noReviews")}
            </div>
          ) : (
            <ul className="space-y-3">
              {ratings.map((r) => (
                <li key={r.id} className="rounded-xl bg-surface p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{r.member_name}</p>
                    <StarRating value={r.score} size="sm" />
                  </div>
                  {r.comment && (
                    <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                      {r.comment}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-400">
                    {formatDateTime(r.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
