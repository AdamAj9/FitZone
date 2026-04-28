import { apiClient } from "./client";
import type { CourseDetail, CourseListItem, Paginated } from "../types/courses";
import type {
  CoachBooking,
  CoachCourseWritePayload,
  CoachDashboard,
  CoachSessionWritePayload,
} from "../types/coach";
import type { CourseSessionItem } from "../types/sessions";

export const coachApi = {
  async dashboard(): Promise<CoachDashboard> {
    const { data } = await apiClient.get<CoachDashboard>("/coach/dashboard/");
    return data;
  },

  async bookings(sessionId?: number): Promise<CoachBooking[]> {
    const { data } = await apiClient.get<CoachBooking[]>("/coach/bookings/", {
      params: sessionId ? { session: sessionId } : undefined,
    });
    return data;
  },

  async myCourses(coachId: number): Promise<Paginated<CourseListItem>> {
    const { data } = await apiClient.get<Paginated<CourseListItem>>(
      "/courses/",
      { params: { coach: coachId } },
    );
    return data;
  },

  async createCourse(payload: CoachCourseWritePayload): Promise<CourseDetail> {
    const { data } = await apiClient.post<CourseDetail>("/courses/", payload);
    return data;
  },

  async updateCourse(
    slug: string,
    payload: Partial<CoachCourseWritePayload>,
  ): Promise<CourseDetail> {
    const { data } = await apiClient.patch<CourseDetail>(
      `/courses/${slug}/`,
      payload,
    );
    return data;
  },

  async deleteCourse(slug: string): Promise<void> {
    await apiClient.delete(`/courses/${slug}/`);
  },

  async mySessions(coachId: number): Promise<Paginated<CourseSessionItem>> {
    const { data } = await apiClient.get<Paginated<CourseSessionItem>>(
      "/sessions/",
      { params: { coach: coachId, ordering: "starts_at" } },
    );
    return data;
  },

  async createSession(payload: CoachSessionWritePayload): Promise<CourseSessionItem> {
    const { data } = await apiClient.post<CourseSessionItem>(
      "/sessions/",
      payload,
    );
    return data;
  },

  async updateSession(
    id: number,
    payload: Partial<CoachSessionWritePayload>,
  ): Promise<CourseSessionItem> {
    const { data } = await apiClient.patch<CourseSessionItem>(
      `/sessions/${id}/`,
      payload,
    );
    return data;
  },

  async deleteSession(id: number): Promise<void> {
    await apiClient.delete(`/sessions/${id}/`);
  },
};
