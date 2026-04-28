import type { CourseSessionItem } from "./sessions";

export interface CoachDashboard {
  courses_count: number;
  upcoming_sessions_count: number;
  bookings_last_30_days: number;
  rating_average: number | null;
  next_session: CourseSessionItem | null;
}

export interface CoachBooking {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  course_session_id: number;
  course_title: string;
  course_slug: string;
  starts_at: string;
  room_name: string;
  channel: "subscription" | "unit";
  channel_display: string;
  created_at: string;
}

export interface CoachCourseWritePayload {
  title: string;
  description: string;
  category: number;
  level: "beginner" | "intermediate" | "advanced" | "all";
  duration_minutes: number;
  capacity: number;
  price_unit: string;
  is_active: boolean;
}

export interface CoachSessionWritePayload {
  course: number;
  room: number;
  starts_at: string;
  ends_at: string;
  capacity?: number;
  status?: "scheduled" | "cancelled" | "completed";
  notes?: string;
}
