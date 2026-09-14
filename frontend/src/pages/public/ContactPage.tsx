import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { contactApi } from "../../api/contact";
import { GradientTail } from "../../components/ui/GradientTail";
import { Reveal } from "../../components/ui/Reveal";
import { VoltGlow } from "../../components/ui/VoltGlow";
import { CONTACT_INFO } from "../../lib/contactInfo";
import type { ContactPayload, ContactSubject } from "../../types/contact";
import { Eyebrow } from "../../components/ui/Eyebrow";
import { PillButton, PillLink } from "../../components/ui/PillButton";

const HERO_IMAGE = "/images/hero/hero-volt-ember.webp";

const SUBJECTS: ContactSubject[] = [
  "membership",
  "classes",
  "coaching",
  "facilities",
  "other",
];

type FaqItem = { q: string; a: string };

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-char-700 bg-char-950/60 px-3.5 py-2.5 text-slate-900 transition placeholder:text-char-400 focus:border-volt-400 focus:outline-none focus:ring-2 focus:ring-volt-400/30";

/** One of the four facts at the top of the page. */
function InfoCard({
  icon,
  title,
  children,
  note,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-char-800 bg-char-900/60 p-5 backdrop-blur-xl transition hover:border-volt-400/40">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-volt-400/30 bg-volt-400/10 text-xl">
        <span aria-hidden>{icon}</span>
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-volt-400">
        {title}
      </p>
      <div className="mt-1.5 text-slate-900">{children}</div>
      {note && <p className="mt-1 text-xs text-char-400">{note}</p>}
    </div>
  );
}

export function ContactPage() {
  const { t } = useTranslation();

  const FAQ = t("contact.faq", { returnObjects: true }) as FaqItem[];

  const schema = useMemo(
    () =>
      z.object({
        last_name: z.string().min(1, t("auth.validation.lastNameRequired")),
        first_name: z.string().min(1, t("auth.validation.firstNameRequired")),
        email: z.string().email(t("auth.validation.emailInvalid")),
        subject: z.enum(["membership", "classes", "coaching", "facilities", "other"]),
        message: z.string().trim().min(4, t("contact.messageTooShort")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactPayload>({
    resolver: zodResolver(schema),
    defaultValues: { subject: "membership" },
  });

  const send = useMutation({
    mutationFn: (values: ContactPayload) => contactApi.send(values),
    onSuccess: () => reset({ subject: "membership" }),
  });

  // 429 is its own message: "try again" is useless advice when the server
  // is telling you to wait.
  const status = (send.error as { response?: { status?: number } } | null)
    ?.response?.status;
  const errorMessage = send.isError
    ? status === 429
      ? t("contact.errorThrottled")
      : t("contact.errorGeneric")
    : null;

  return (
    <div className="space-y-6">
      {/* === HERO === */}
      <Reveal className="relative isolate overflow-hidden rounded-2xl border border-char-800 bg-char-900/60 backdrop-blur-xl lg:grid lg:grid-cols-[1.15fr_1fr]">
        <div className="relative z-10 p-6 sm:p-10">
          <VoltGlow subtle />
          <div className="relative">
            <Eyebrow>{t("contact.label")}</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
              <GradientTail text={t("contact.title")} />
            </h1>
            <p className="mt-3 max-w-md text-char-300">{t("contact.subtitle")}</p>
          </div>
        </div>
        <div className="relative hidden lg:block" aria-hidden>
          <img
            src={HERO_IMAGE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[42%_top]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-char-900 via-char-900/50 to-transparent" />
        </div>
      </Reveal>

      {/* === THE FOUR FACTS === */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal className="h-full">
          <InfoCard icon="📞" title={t("contact.phoneTitle")} note={t("contact.phoneNote")}>
            <a
              href={CONTACT_INFO.phoneHref}
              className="font-medium transition hover:text-volt-400"
            >
              {CONTACT_INFO.phone}
            </a>
          </InfoCard>
        </Reveal>
        <Reveal delay={80} className="h-full">
          <InfoCard icon="✉️" title={t("contact.emailTitle")} note={t("contact.emailNote")}>
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="break-all font-medium transition hover:text-volt-400"
            >
              {CONTACT_INFO.email}
            </a>
          </InfoCard>
        </Reveal>
        <Reveal delay={160} className="h-full">
          <InfoCard icon="📍" title={t("contact.addressTitle")} note={t("contact.addressNote")}>
            <p className="font-medium">{CONTACT_INFO.street}</p>
            <p className="font-medium">{CONTACT_INFO.city}</p>
          </InfoCard>
        </Reveal>
        <Reveal delay={240} className="h-full">
          <InfoCard icon="🕒" title={t("contact.hoursTitle")}>
            <dl className="space-y-0.5 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-char-400">{t("contact.hoursWeekdays")}</dt>
                <dd className="font-medium tabular-nums">
                  {CONTACT_INFO.hours.weekdays}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-char-400">{t("contact.hoursWeekend")}</dt>
                <dd className="font-medium tabular-nums">
                  {CONTACT_INFO.hours.weekend}
                </dd>
              </div>
            </dl>
          </InfoCard>
        </Reveal>
      </div>

      {/* === FORM + MAP === */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal className="rounded-2xl border border-char-800 bg-char-900/60 p-6 backdrop-blur-xl sm:p-8">
          <Eyebrow>{t("contact.formLabel")}</Eyebrow>
          <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
            <GradientTail text={t("contact.formTitle")} />
          </h2>

          {send.isSuccess ? (
            <div
              role="status"
              className="mt-6 rounded-xl border border-volt-400/40 bg-volt-400/10 p-5"
            >
              <p className="font-display font-bold text-volt-400">
                {t("contact.successTitle")}
              </p>
              <p className="mt-1 text-sm text-char-200">
                {t("contact.successBody")}
              </p>
              <button
                type="button"
                onClick={() => send.reset()}
                className="mt-4 text-sm font-medium text-volt-400 underline-offset-4 transition hover:underline"
              >
                {t("contact.formLabel")}
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit((v) => send.mutate(v))}
              className="mt-6 space-y-4"
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-last"
                    className="block text-sm font-medium text-slate-700"
                  >
                    {t("contact.fieldLastName")}
                  </label>
                  <input
                    id="contact-last"
                    autoComplete="family-name"
                    {...register("last_name")}
                    className={fieldClass}
                  />
                  {errors.last_name && (
                    <p className="mt-1.5 text-sm text-red-700">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="contact-first"
                    className="block text-sm font-medium text-slate-700"
                  >
                    {t("contact.fieldFirstName")}
                  </label>
                  <input
                    id="contact-first"
                    autoComplete="given-name"
                    {...register("first_name")}
                    className={fieldClass}
                  />
                  {errors.first_name && (
                    <p className="mt-1.5 text-sm text-red-700">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-slate-700"
                  >
                    {t("contact.fieldEmail")}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    className={fieldClass}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-700">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-medium text-slate-700"
                  >
                    {t("contact.fieldSubject")}
                  </label>
                  <select
                    id="contact-subject"
                    {...register("subject")}
                    className={fieldClass}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {t(`contact.subjects.${s}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-slate-700"
                >
                  {t("contact.fieldMessage")}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder={t("contact.messagePlaceholder")}
                  {...register("message")}
                  className={`${fieldClass} resize-y`}
                />
                {errors.message && (
                  <p className="mt-1.5 text-sm text-red-700">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700"
                >
                  {errorMessage}
                </p>
              )}

              <PillButton type="submit" disabled={send.isPending} fullWidth size="lg">
                {send.isPending ? t("contact.sending") : t("contact.submit")}
              </PillButton>
            </form>
          )}
        </Reveal>

        <Reveal
          delay={100}
          className="flex flex-col overflow-hidden rounded-2xl border border-char-800 bg-char-900/60 backdrop-blur-xl"
        >
          <div className="p-6 sm:p-8">
            <Eyebrow>{t("contact.mapLabel")}</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              <GradientTail text={t("contact.mapTitle")} />
            </h2>
            <p className="mt-2 text-sm text-char-300">{t("contact.mapBody")}</p>
            <a
              href={CONTACT_INFO.map.external}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-char-700 px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-volt-400/50 hover:text-volt-400"
            >
              {t("contact.openMap")} →
            </a>
          </div>
          {/* OpenStreetMap needs no key and sets no tracking cookie. Its
              tiles are light, so they are inverted to sit on the dark page. */}
          <iframe
            title={t("contact.mapTitle")}
            src={CONTACT_INFO.map.embed}
            loading="lazy"
            className="min-h-[18rem] w-full flex-1 border-0"
            style={{
              filter:
                "invert(0.93) hue-rotate(180deg) saturate(0.35) brightness(0.88) contrast(1.05)",
            }}
          />
        </Reveal>
      </div>

      {/* === FAQ === */}
      <Reveal className="relative isolate overflow-hidden rounded-2xl border border-char-800 bg-char-900/60 p-6 backdrop-blur-xl sm:p-8">
        <VoltGlow subtle flip />
        <div className="relative">
          <Eyebrow>{t("contact.faqLabel")}</Eyebrow>
          <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
            <GradientTail text={t("contact.faqTitle")} />
          </h2>
          {/* Native <details>: keyboard accessible and searchable by the
              browser's find-in-page without any JS. */}
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-char-800 bg-char-950/40 px-4 py-3 transition hover:border-volt-400/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden
                    className="shrink-0 text-lg text-volt-400 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-char-300">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Reveal>

      {/* === CTA === */}
      <Reveal className="relative isolate overflow-hidden rounded-2xl border border-char-800 bg-char-900/60 p-8 backdrop-blur-xl">
        <VoltGlow />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              <GradientTail text={t("contact.ctaTitle")} />
            </h2>
            <p className="mt-1 text-char-300">{t("contact.ctaBody")}</p>
          </div>
          <PillLink to="/register" size="lg">
            {t("contact.ctaButton")}
          </PillLink>
        </div>
      </Reveal>
    </div>
  );
}
