import type { TFunction } from "i18next";

import type { SubscriptionPlan } from "../types/subscriptions";

export type PlanCatalogEntry = {
  name: string;
  description: string;
  features: string[];
};

/**
 * The subscription plan's name/description/features come from the backend
 * database (seeded in French only) and aren't translated by Django. This
 * looks up the localized copy from planCatalog.<slug> in the active locale,
 * falling back to the raw API values for any plan the catalog doesn't know
 * about yet.
 */
export function localizedPlan(t: TFunction, plan: SubscriptionPlan) {
  const entry = t(`planCatalog.${plan.slug}`, {
    returnObjects: true,
    defaultValue: null,
  }) as PlanCatalogEntry | null;

  return {
    name: entry?.name ?? plan.name,
    description: entry?.description ?? plan.description,
    features: entry?.features ?? plan.features,
  };
}
