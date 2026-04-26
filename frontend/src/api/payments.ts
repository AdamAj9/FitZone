import { apiClient } from "./client";
import type { CheckoutResponse, PaymentsPage } from "../types/payments";

export const paymentsApi = {
  async checkoutSubscription(planId: number): Promise<CheckoutResponse> {
    const { data } = await apiClient.post<CheckoutResponse>(
      "/payments/checkout/subscription/",
      { plan_id: planId },
    );
    return data;
  },

  async checkoutCourse(
    courseId: number,
    courseSessionId?: number,
  ): Promise<CheckoutResponse> {
    const payload: Record<string, number> = { course_id: courseId };
    if (courseSessionId != null) payload.course_session_id = courseSessionId;
    const { data } = await apiClient.post<CheckoutResponse>(
      "/payments/checkout/course/",
      payload,
    );
    return data;
  },

  async listMine(): Promise<PaymentsPage> {
    const { data } = await apiClient.get<PaymentsPage>("/payments/");
    return data;
  },

  async verifyCheckout(sessionId: string): Promise<{
    status: "pending" | "succeeded" | "failed" | "refunded";
    already_activated?: boolean;
    stripe_status?: string;
  }> {
    const { data } = await apiClient.get("/payments/checkout/verify/", {
      params: { session_id: sessionId },
    });
    return data;
  },
};
