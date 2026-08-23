import { useTranslation } from "react-i18next";

export type PasswordRule = {
  id: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", test: (pw) => pw.length >= 8 },
  { id: "letter", test: (pw) => /[a-zA-Z]/.test(pw) },
  { id: "digit", test: (pw) => /\d/.test(pw) },
];

export function passwordRulesMet(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

type PasswordRequirementsProps = {
  password: string;
  /** When provided, adds a live "passwords match" row. */
  confirmPassword?: string;
  className?: string;
};

/** Live checklist of password requirements, shown under password fields. */
export function PasswordRequirements({
  password,
  confirmPassword,
  className = "",
}: PasswordRequirementsProps) {
  const { t } = useTranslation();

  const rows = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: t(`auth.passwordRules.${rule.id}`),
    met: rule.test(password),
  }));

  if (confirmPassword !== undefined) {
    rows.push({
      id: "match",
      label: t("auth.passwordRules.match"),
      met: password.length > 0 && password === confirmPassword,
    });
  }

  return (
    <ul className={`space-y-1 ${className}`}>
      {rows.map((row) => (
        <li
          key={row.id}
          className={`flex items-center gap-2 text-xs transition-colors ${
            row.met ? "text-accent-600" : "text-slate-400"
          }`}
        >
          <span
            aria-hidden
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] transition-colors ${
              row.met ? "bg-accent-100 text-accent-700" : "bg-slate-100 text-slate-400"
            }`}
          >
            {row.met ? "✓" : "•"}
          </span>
          {row.label}
        </li>
      ))}
    </ul>
  );
}
