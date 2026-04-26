import type { Paginated } from "./courses";

export type Tier = "basic" | "premium";
export type Period = "monthly" | "yearly";
export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled";

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  tier: Tier;
  tier_display: string;
  period: Period;
  period_display: string;
  price: string;
  description: string;
  features: string[];
  includes_classes: boolean;
  duration_days: number;
  is_active: boolean;
}

export interface Subscription {
  id: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  status_display: string;
  starts_at: string | null;
  ends_at: string | null;
  cancelled_at: string | null;
  price_paid: string;
  is_currently_active: boolean;
  days_remaining: number | null;
  created_at: string;
}

export type PlansPage = Paginated<SubscriptionPlan>;
export type SubscriptionsPage = Paginated<Subscription>;

export interface CurrentSubscriptionResponse {
  subscription: Subscription | null;
}
