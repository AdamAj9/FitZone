import type { Paginated } from "./courses";

export type PaymentKind = "subscription" | "course";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface Payment {
  id: number;
  kind: PaymentKind;
  kind_display: string;
  status: PaymentStatus;
  status_display: string;
  amount: string;
  currency: string;
  subscription: number | null;
  subscription_plan: string | null;
  course: number | null;
  course_title: string | null;
  course_session: number | null;
  stripe_session_id: string;
  created_at: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export type PaymentsPage = Paginated<Payment>;
