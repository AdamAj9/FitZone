import { useTranslation } from "react-i18next";

interface Props {
  title: string;
  description?: string;
}

export function Placeholder({ title, description }: Props) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-surface p-12 text-center shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      {description ? (
        <p className="mt-3 text-slate-500">{description}</p>
      ) : (
        <p className="mt-3 text-slate-500">{t("common.comingSoon")}</p>
      )}
    </div>
  );
}
