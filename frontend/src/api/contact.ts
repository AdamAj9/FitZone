import { apiClient } from "./client";
import type { ContactPayload } from "../types/contact";

export const contactApi = {
  /** Public endpoint — no auth, rate limited server-side to 5/hour per IP. */
  async send(payload: ContactPayload): Promise<void> {
    await apiClient.post("/contact/", payload);
  },
};
