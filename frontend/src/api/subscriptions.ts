import { apiClient } from "./client";
import type {
  CurrentSubscriptionResponse,
  PlansPage,
  Subscription,
  SubscriptionsPage,
} from "../types/subscriptions";

export const subscriptionsApi = {
  async listPlans(): Promise<PlansPage> {
    const { data } = await apiClient.get<PlansPage>("/plans/");
    return data;
  },

  async listMine(): Promise<SubscriptionsPage> {
    const { data } = await apiClient.get<SubscriptionsPage>("/subscriptions/");
    return data;
  },

  async current(): Promise<CurrentSubscriptionResponse> {
    const { data } = await apiClient.get<CurrentSubscriptionResponse>(
      "/subscriptions/current/",
    );
    return data;
  },

  async subscribe(planId: number, activateNow = true): Promise<Subscription> {
    const { data } = await apiClient.post<Subscription>(
      "/subscriptions/subscribe/",
      { plan_id: planId, activate_now: activateNow },
    );
    return data;
  },

  async cancel(id: number): Promise<Subscription> {
    const { data } = await apiClient.post<Subscription>(
      `/subscriptions/${id}/cancel/`,
    );
    return data;
  },
};
