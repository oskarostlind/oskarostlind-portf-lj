"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { site } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const t = useTranslations("contact.form");
  const e = useTranslations("contact.errors");
  const [status, setStatus] = useState<Status>("idle");

  const schema = z.object({
    name: z.string().trim().min(2, e("nameShort")),
    email: z.string().trim().email(e("emailInvalid")),
    company: z.string().trim().optional(),
    budget: z.string().trim().optional(),
    message: z.string().trim().min(15, e("messageShort")),
    website: z.string().optional(),
  });

  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-[var(--color-accent)]/35 bg-[var(--color-accent-dim)] p-8"
      >
        <p className="font-[family-name:var(--font-display)] text-xl tracking-[-0.02em]">
          {t("successTitle")}
        </p>
        <p className="mt-3 text-sm text-[var(--color-muted)]">{t("successBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <Field
          label={t("name")}
          required
          requiredLabel={t("required")}
          error={errors.name?.message}
        >
          {(id, describedBy) => (
            <input
              {...register("name")}
              id={id}
              type="text"
              autoComplete="name"
              placeholder={t("namePlaceholder")}
              aria-invalid={!!errors.name}
              aria-describedby={describedBy}
              className={inputClass}
            />
          )}
        </Field>

        <Field
          label={t("email")}
          required
          requiredLabel={t("required")}
          error={errors.email?.message}
        >
          {(id, describedBy) => (
            <input
              {...register("email")}
              id={id}
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              aria-invalid={!!errors.email}
              aria-describedby={describedBy}
              className={inputClass}
            />
          )}
        </Field>

        <Field label={t("company")} requiredLabel={t("optional")}>
          {(id) => (
            <input
              {...register("company")}
              id={id}
              type="text"
              autoComplete="organization"
              placeholder={t("companyPlaceholder")}
              className={inputClass}
            />
          )}
        </Field>

        <Field label={t("budget")} requiredLabel={t("optional")}>
          {(id) => (
            <input
              {...register("budget")}
              id={id}
              type="text"
              placeholder={t("budgetPlaceholder")}
              className={inputClass}
            />
          )}
        </Field>
      </div>

      <Field
        label={t("message")}
        required
        requiredLabel={t("required")}
        error={errors.message?.message}
      >
        {(id, describedBy) => (
          <textarea
            {...register("message")}
            id={id}
            rows={6}
            placeholder={t("messagePlaceholder")}
            aria-invalid={!!errors.message}
            aria-describedby={describedBy}
            className={`${inputClass} resize-y`}
          />
        )}
      </Field>

      {/* Honeypot — dold för människor, lockande för bottar */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="website">Website</label>
        <input {...register("website")} id="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-[#ff6b6b]">
          {t("errorTitle")} {t("errorBody")}{" "}
          <a href={`mailto:${site.email}`} className="underline underline-offset-4">
            {site.email}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        data-magnetic
        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[var(--color-ink)] px-8 py-4 text-sm font-medium text-[var(--color-void)] disabled:opacity-60"
      >
        <span className="relative z-10">
          {status === "sending" ? t("sending") : t("submit")}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 translate-y-full bg-[var(--color-accent)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0"
        />
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3.5 text-[0.95rem] text-[var(--color-ink)] placeholder:text-[var(--color-dim)] transition-colors duration-300 focus:border-[var(--color-accent)] aria-[invalid=true]:border-[#ff6b6b]";

function Field({
  label,
  required,
  requiredLabel,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  requiredLabel: string;
  error?: string;
  children: (id: string, describedBy?: string) => React.ReactNode;
}) {
  const id = `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2.5 flex items-baseline gap-2">
        <span className="text-sm text-[var(--color-ink)]">{label}</span>
        <span className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-dim)]">
          {requiredLabel}
        </span>
      </label>
      {children(id, error ? errorId : undefined)}
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-xs text-[#ff6b6b]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
