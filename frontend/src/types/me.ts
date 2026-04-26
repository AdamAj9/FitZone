import type { Booking } from "./bookings";
import type { CourseSessionItem } from "./sessions";

export interface CategoryBreakdownEntry {
  category: string;
  count: number;
}

export interface MyStats {
  total_attended: number;
  upcoming_count: number;
  last_30_days: number;
  favorite_category: string | null;
  category_breakdown: CategoryBreakdownEntry[];
  next_booking: Booking | null;
}

export interface RecommendationsResponse {
  based_on: {
    history_categories: string[];
    questionnaire_categories: string[];
    level: string | null;
  };
  results: CourseSessionItem[];
}

export interface QuestionnairePayload {
  level: "beginner" | "intermediate" | "advanced";
  goals: string;
  favorite_categories: string[];
}

export interface QuestionnaireResponse {
  date_of_birth: string | null;
  level: "beginner" | "intermediate" | "advanced";
  goals: string;
  preferences: { categories?: string[] } & Record<string, unknown>;
  questionnaire_completed: boolean;
}
