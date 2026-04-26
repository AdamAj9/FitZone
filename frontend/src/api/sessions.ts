import { apiClient } from "./client";
import type { Paginated } from "../types/courses";
import type {
  CourseSessionItem,
  Room,
  SessionFilters,
  SessionsPage,
} from "../types/sessions";

export const sessionsApi = {
  async listRooms(): Promise<Paginated<Room>> {
    const { data } = await apiClient.get<Paginated<Room>>("/rooms/");
    return data;
  },

  async listSessions(filters: SessionFilters = {}): Promise<SessionsPage> {
    const params: Record<string, string> = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.course != null) params.course = String(filters.course);
    if (filters.course__slug) params.course__slug = filters.course__slug;
    if (filters.course__category__slug)
      params.course__category__slug = filters.course__category__slug;
    if (filters.coach != null) params.coach = String(filters.coach);
    if (filters.room != null) params.room = String(filters.room);
    if (filters.upcoming) params.upcoming = "1";
    if (filters.status) params.status = filters.status;

    const { data } = await apiClient.get<SessionsPage>("/sessions/", {
      params,
    });
    return data;
  },

  async getSession(id: number): Promise<CourseSessionItem> {
    const { data } = await apiClient.get<CourseSessionItem>(`/sessions/${id}/`);
    return data;
  },
};
