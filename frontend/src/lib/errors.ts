/** Extract a human-friendly message from an Axios-like error.
 *  Falls back to the provided default if the response shape doesn't match. */
export function apiErrorMessage(error: unknown, fallback = "Une erreur est survenue"): string {
  const e = error as
    | { response?: { data?: unknown } }
    | undefined;
  const data = e?.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    const firstField = Object.entries(obj).find(([, v]) =>
      Array.isArray(v) || typeof v === "string",
    );
    if (firstField) {
      const [, val] = firstField;
      return Array.isArray(val) ? String(val[0]) : String(val);
    }
  }
  return fallback;
}
