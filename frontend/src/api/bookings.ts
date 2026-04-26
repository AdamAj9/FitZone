import { apiClient } from "./client";
import type { Booking, BookingsPage } from "../types/bookings";

export const bookingsApi = {
  async listMine(): Promise<BookingsPage> {
    const { data } = await apiClient.get<BookingsPage>("/bookings/");
    return data;
  },

  async book(courseSessionId: number): Promise<Booking> {
    const { data } = await apiClient.post<Booking>("/bookings/book/", {
      course_session_id: courseSessionId,
    });
    return data;
  },

  async cancel(id: number): Promise<Booking> {
    const { data } = await apiClient.post<Booking>(`/bookings/${id}/cancel/`);
    return data;
  },
};
