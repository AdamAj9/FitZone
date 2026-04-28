import type { Paginated } from "./courses";

export interface Rating {
  id: number;
  member: number;
  member_name: string;
  coach: number;
  coach_name: string;
  course_session: number | null;
  score: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface RatingPayload {
  coach: number;
  course_session?: number | null;
  score: number;
  comment?: string;
}

export type RatingsPage = Paginated<Rating>;
