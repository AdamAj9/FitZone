import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { adminApi } from "../../api/admin";
import { formatDateTime } from "../../lib/date";

const ACTIONS = [
  "login",
  "register",
  "sub_activated",
  "sub_cancelled",
  "pay_succeeded",
  "pay_failed",
  "book_created",
  "book_cancelled",
  "admin_user_toggled",
  "admin_user_role_changed",
];

export function AdminLogsPage() {
  const { t } = useTranslation();
  const [action, setAction] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-logs", { action }],
    queryFn: () => adminApi.listLogs({ action: action || undefined }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t("adminLogs.title")}</h1>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">{t("adminLogs.allActions")}</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-slate-500">{t("common.loading")}</p>
        ) : (data?.results.length ?? 0) === 0 ? (
          <p className="p-8 text-center text-slate-500">{t("adminLogs.empty")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("myPayments.colDate")}</th>
                <th className="px-4 py-3 font-medium">{t("adminLogs.colActor")}</th>
                <th className="px-4 py-3 font-medium">{t("adminLogs.colAction")}</th>
                <th className="px-4 py-3 font-medium">{t("adminLogs.colTarget")}</th>
                <th className="px-4 py-3 font-medium">{t("adminLogs.colMetadata")}</th>
                <th className="px-4 py-3 font-medium">{t("adminLogs.colIp")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.results.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {formatDateTime(l.created_at)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {l.actor_email ?? t("adminLogs.system")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {l.target_type ? `${l.target_type}#${l.target_id ?? "?"}` : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {Object.keys(l.metadata).length === 0
                      ? "—"
                      : JSON.stringify(l.metadata)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {l.ip_address ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
