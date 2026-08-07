import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="shell flex min-h-[70svh] flex-col justify-center py-32">
      <p className="eyebrow">404</p>
      <h1 className="display-lg mt-5 max-w-[14ch]">{t("title")}</h1>
      <p className="lede mt-5">{t("body")}</p>
      <Link
        href="/"
        className="mt-10 inline-flex w-fit rounded-full border border-[var(--color-line-strong)] px-7 py-3.5 text-sm transition-colors duration-500 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
