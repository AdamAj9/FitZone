import type { Paginated } from "./courses";

export type SessionStatus = "scheduled" | "cancelled" | "completed";

export interface Room {
  id: number;
  name: string;
  building: "main" | "annex";
  building_display: string;
  capacity: number;
  is_active: boolean;
  notes: string;
}

export interface CourseSessionItem {
  id: number;
  course_id: number;
  course_title: string;
  course_slug: string;
  category: string;
  category_slug: string;
  coach_id: number | null;
  coach_name: string | null;
  room_id: number;
  room_name: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  seats_taken: number;
  seats_available: number;
  status: SessionStatus;
}

export interface SessionFilters {
  from?: string;
  to?: string;
  course?: number;
  course__slug?: string;
  course__category__slug?: string;
  coach?: number;
  room?: number;
  upcoming?: boolean;
  status?: SessionStatus;
}

export type SessionsPage = Paginated<CourseSessionItem>;
