import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

/** Une ligne de tableau : autant de cellules que de colonnes déclarées. */
type LegalTable = {
  columns: string[];
  rows: string[][];
};

/** Une section d'un document légal, telle que décrite dans les fichiers de traduction. */
type LegalSection = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  table?: LegalTable;
};

type LegalDocumentProps = {
  /** Préfixe de la clé i18n du document, par exemple "legal.privacy". */
  tKey: string;
};

/**
 * Rendu générique d'un document légal (mentions légales, CGU, confidentialité,
 * cookies). Le contenu vit intégralement dans les fichiers de traduction afin
 * que chaque document existe en français et en anglais.
 */
export function LegalDocument({ tKey }: LegalDocumentProps) {
  const { t } = useTranslation();

  const rawSections = t(`${tKey}.sections`, { returnObjects: true });
  const sections: LegalSection[] = Array.isArray(rawSections) ? rawSections : [];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-surface p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
          {t("legal.sectionLabel")}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {t(`${tKey}.title`)}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">{t(`${tKey}.intro`)}</p>
        <p className="mt-4 text-sm text-slate-500">{t("legal.lastUpdated")}</p>

        <p className="mt-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-semibold">{t("legal.academicTitle")}</span>{" "}
          {t("legal.academicNotice")}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-4">
        {sections.length > 1 && (
          <nav
            aria-label={t("legal.tocTitle")}
            className="min-w-0 rounded-2xl bg-surface p-6 shadow-sm lg:col-span-1 lg:sticky lg:top-6 lg:self-start"
          >
            <p className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {t("legal.tocTitle")}
            </p>
            <ol className="mt-4 space-y-2 text-sm">
              {sections.map((section, index) => (
                <li key={section.heading}>
                  <a
                    href={`#section-${index + 1}`}
                    className="text-slate-600 transition hover:text-brand-700"
                  >
                    {index + 1}. {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <article
          className={`min-w-0 rounded-2xl bg-surface p-4 shadow-sm sm:p-8 ${
            sections.length > 1 ? "lg:col-span-3" : "lg:col-span-4"
          }`}
        >
          {sections.map((section, index) => (
            <section
              key={section.heading}
              id={`section-${index + 1}`}
              className="scroll-mt-6 border-t border-slate-200 pt-8 first:border-t-0 first:pt-0 [&+section]:mt-8"
            >
              <h2 className="text-xl font-bold text-slate-900">
                {index + 1}. {section.heading}
              </h2>

              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-relaxed text-slate-700">
                  {paragraph}
                </p>
              ))}

              {section.items && (
                <ul className="mt-3 space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2 text-slate-700">
                      <span aria-hidden="true" className="text-brand-600">
                        •
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.table && (
                <div className="mt-4 -mx-1 overflow-x-auto px-1">
                  <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
                    <thead>
                      <tr>
                        {section.table.columns.map((column) => (
                          <th
                            key={column}
                            scope="col"
                            className="border-b-2 border-brand-200 pb-2 pr-4 font-semibold text-slate-900"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.join("|")}>
                          {row.map((cell) => (
                            <td
                              key={cell}
                              className="border-b border-slate-200 py-3 pr-4 align-top text-slate-700"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          <footer className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600">{t("legal.contactLine")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/legal/privacy"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-surface-hover"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                to="/legal/terms"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-surface-hover"
              >
                {t("footer.terms")}
              </Link>
              <Link
                to="/legal/notice"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-surface-hover"
              >
                {t("footer.legalNotice")}
              </Link>
              <Link
                to="/legal/cookies"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-surface-hover"
              >
                {t("footer.cookies")}
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
