"use client";
import { useTranslations } from "next-intl";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations();
  return (
    <div className="empty-state">
      <h2>{t("errorTitle")}</h2>
      <button className="button dark" onClick={reset}>
        {t("retry")}
      </button>
    </div>
  );
}
