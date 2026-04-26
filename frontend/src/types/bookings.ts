import type { Paginated } from "./courses";

export type BookingStatus = "confirmed" | "cancelled" | "attended" | "no_show";
export type BookingChannel = "subscription" | "unit";

export interface Booking {
  id: number;
  status: BookingStatus;
  status_display: string;
  channel: BookingChannel;
  channel_display: string;
  course_session_id: number;
  course_id: number;
  course_title: string;
  course_slug: string;
  starts_at: string;
  ends_at: string;
  room_name: string;
  payment: number | null;
  cancelled_at: string | null;
  created_at: string;
}

export type BookingsPage = Paginated<Booking>;
