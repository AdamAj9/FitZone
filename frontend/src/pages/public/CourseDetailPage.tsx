import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import { bookingsApi } from "../../api/bookings";
import { coursesApi } from "../../api/courses";
import { paymentsApi } from "../../api/payments";
import { sessionsApi } from "../../api/sessions";
import { subscriptionsApi } from "../../api/subscriptions";
import { formatDateTime } from "../../lib/date";
import { apiErrorMessage } from "../../lib/errors";
import { useAuthStore } from "../../store/auth";
import type { CourseSessionItem } from "../../types/sessions";
import { CourseCard } from "../../components/CourseCard";

interface SessionRowProps {
  session: CourseSessionItem;
  premium: boolean;
  unitPrice: number;
  onBook: (sessionId: number) => void;
  onPay: (sessionId: number) => void;
  busy: boolean;
}

function SessionRow({
  session,
  premium,
  unitPrice,
  onBook,
  onPay,
  busy,
}: SessionRowProps) {
  const { t } = useTranslation();
  const isFull = session.seats_available <= 0;

  return (
    <li className="flex items-center justify-between gap-3 py-3 text-sm">
      <div>
        <p className="font-medium text-slate-900">
          {formatDateTime(session.starts_at)}
        </p>
        <p className="text-xs text-slate-500">
          {session.room_name} · {session.coach_name ?? "—"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
          {session.seats_available}/{session.capacity}
        </span>
        {isFull ? (
          <span className="rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-500">
            {t("courseDetail.full")}
          </span>
        ) : premium ? (
          <button
            type="button"
            onClick={() => onBook(session.id)}
            disabled={busy}
            className="rounded-md bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {t("courseDetail.book")}
          </button>
        ) : unitPrice > 0 ? (
          <button
            type="button"
            onClick={() => onPay(session.id)}
            disabled={busy}
            className="rounded-md border border-brand-600 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
          >
            {t("courseDetail.pay")} {unitPrice.toFixed(2)} €
          </button>
        ) : (
          <span className="rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-500">
            {t("courseDetail.unavailable")}
          </span>
        )}
      </div>
    </li>
  );
}

export function CourseDetailPage() {
  const { t } = useTranslation();
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const levelLabel: Record<string, string> = {
    beginner: t("common.levels.beginner"),
    intermediate: t("common.levels.intermediate"),
    advanced: t("common.levels.advanced"),
    all: t("common.levels.all"),
  };

  const courseQuery = useQuery({
    queryKey: ["course", slug],
    queryFn: () => coursesApi.getCourse(slug),
    enabled: Boolean(slug),
  });

  const sessionsQuery = useQuery({
    queryKey: ["course-sessions", slug],
    queryFn: () =>
      sessionsApi.listSessions({ course__slug: slug, upcoming: true }),
    enabled: Boolean(slug),
  });

  const subQuery = useQuery({
    queryKey: ["subscription-current"],
    queryFn: () => subscriptionsApi.current(),
    enabled: Boolean(user),
  });

  const similarQuery = useQuery({
    queryKey: ["similar-courses", courseQuery.data?.category.slug],
    queryFn: () =>
      coursesApi.listCourses({ category__slug: courseQuery.data!.category.slug }),
    enabled: Boolean(courseQuery.data),
  });

  const bookMutation = useMutation({
    mutationFn: (sessionId: number) => bookingsApi.book(sessionId),
    onSuccess: () => {
      toast.success(t("courseDetail.bookingConfirmed"));
      void queryClient.invalidateQueries({ queryKey: ["course-sessions", slug] });
      void queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      navigate("/my-bookings");
    },
    onError: (e) => toast.error(apiErrorMessage(e, t("courseDetail.bookingError"))),
  });

  const payMutation = useMutation({
    mutationFn: (sessionId: number) =>
      paymentsApi.checkoutCourse(courseQuery.data!.id, sessionId),
    onSuccess: ({ checkout_url }) => {
      window.location.href = checkout_url;
    },
    onError: (e) => toast.error(apiErrorMessage(e, t("courseDetail.paymentError"))),
  });

  if (courseQuery.isLoading) {
    return <p className="text-slate-500">{t("common.loading")}</p>;
  }
  if (courseQuery.isError || !courseQuery.data) {
    return (
      <div className="rounded-2xl bg-surface p-12 text-center shadow-sm">
        <p className="text-slate-500">{t("courseDetail.notFound")}</p>
        <Link to="/courses" className="mt-4 inline-block text-brand-600 hover:underline">
          ← {t("courseDetail.backToCatalog")}
        </Link>
      </div>
    );
  }

  const course = courseQuery.data;
  const isPremium =
    subQuery.data?.subscription?.is_currently_active &&
    subQuery.data.subscription.plan.includes_classes;
  const unitPrice = Number(course.price_unit);
  const busy = bookMutation.isPending || payMutation.isPending;

  const handleBook = (sessionId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }
    bookMutation.mutate(sessionId);
  };

  const handlePay = (sessionId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }
    payMutation.mutate(sessionId);
  };

  const apiError = (bookMutation.error ?? payMutation.error) as
    | { response?: { data?: { detail?: string } } }
    | null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
         <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-50">
            <img
              src={`/images/courses/${course.slug}.png`}
              alt={course.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="p-6">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {course.category.name}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              {course.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
              <span>{levelLabel[course.level] ?? course.level}</span>
              <span>·</span>
              <span>{course.duration_minutes} min</span>
              <span>·</span>
              <span>{t("courseDetail.capacity")} {course.capacity}</span>
            </div>
            <p className="mt-4 whitespace-pre-line text-slate-700">
              {course.description}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("courseDetail.upcomingSessions")}
          </h2>
          {apiError?.response?.data?.detail && (
            <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {apiError.response.data.detail}
            </div>
          )}
          {sessionsQuery.isLoading ? (
            <p className="mt-3 text-sm text-slate-500">{t("common.loading")}</p>
          ) : (sessionsQuery.data?.results.length ?? 0) === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              {t("courseDetail.noSessions")}
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {sessionsQuery.data?.results.slice(0, 8).map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  premium={Boolean(isPremium)}
                  unitPrice={unitPrice}
                  onBook={handleBook}
                  onPay={handlePay}
                  busy={busy}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-surface p-6 shadow-sm">
          <p className="text-sm text-slate-500">{t("courseDetail.unitPrice")}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {unitPrice > 0
              ? `${unitPrice.toFixed(2)} €`
              : t("courseDetail.includedInSubscription")}
          </p>
          {!user ? (
            <Link
              to="/login"
              className="mt-4 block w-full rounded-md bg-brand-600 px-4 py-2 text-center font-medium text-white hover:bg-brand-700"
            >
              {t("courseDetail.loginToBook")}
            </Link>
          ) : isPremium ? (
            <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
              ✓ {t("courseDetail.includedInPremium")}
            </p>
          ) : unitPrice > 0 ? (
            <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              {t("courseDetail.payHint")}
            </p>
          ) : (
            <Link
              to="/plans"
              className="mt-4 block rounded-md border border-brand-600 px-4 py-2 text-center text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              {t("courseDetail.subscribePremium")}
            </Link>
          )}
        </div>

        {course.coach && (
          <div className="rounded-2xl bg-surface p-6 shadow-sm">
            <p className="text-sm text-slate-500">{t("courseDetail.coach")}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {course.coach.full_name}
            </p>
            {course.coach.coach_profile?.specialties && (
              <p className="mt-1 text-sm text-slate-600">
                {course.coach.coach_profile.specialties}
              </p>
            )}
            {course.coach.coach_profile?.bio && (
              <p className="mt-3 text-sm text-slate-600">
                {course.coach.coach_profile.bio}
              </p>
            )}
            <Link
              to={`/coaches/${course.coach.id}`}
              className="mt-3 inline-block text-sm text-brand-600 hover:underline"
            >
              {t("courseDetail.viewProfile")} →
            </Link>
          </div>
        )}
      {course.coach &&
          (course.coach.rating_count ?? 0) > 0 && (
            <div className="rounded-2xl bg-surface p-6 shadow-sm">
              <p className="text-sm text-slate-500">{t("courseDetail.coachReviews")}</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
                ⭐ {course.coach.rating_average?.toFixed(1)}
                <span className="text-sm font-normal text-slate-500">
                  ({course.coach.rating_count} {t("courseDetail.reviewsCount")})
                </span>
              </p>
              <Link
                to={`/coaches/${course.coach.id}`}
                className="mt-2 inline-block text-sm text-brand-600 hover:underline"
              >
                {t("courseDetail.viewAllReviews")} →
              </Link>
            </div>
          )}
      </aside>

      {(similarQuery.data?.results.filter((c) => c.slug !== course.slug)
        .length ?? 0) > 0 && (
        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("courseDetail.similarCourses")}
          </h2>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {similarQuery.data?.results
              .filter((c) => c.slug !== course.slug)
              .slice(0, 3)
              .map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
