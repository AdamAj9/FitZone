import { apiClient } from "./client";
import type {
  Category,
  CoachPublic,
  CourseDetail,
  CourseFilters,
  CourseListItem,
  Paginated,
} from "../types/courses";

export const coursesApi = {
  async listCategories(): Promise<Paginated<Category>> {
    const { data } = await apiClient.get<Paginated<Category>>("/categories/");
    return data;
  },

  async listCourses(filters: CourseFilters = {}): Promise<Paginated<CourseListItem>> {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category__slug) params.category__slug = filters.category__slug;
    if (filters.level) params.level = filters.level;
    if (filters.coach != null) params.coach = String(filters.coach);
    if (filters.ordering) params.ordering = filters.ordering;
    const { data } = await apiClient.get<Paginated<CourseListItem>>(
      "/courses/",
      { params },
    );
    return data;
  },

  async getCourse(slug: string): Promise<CourseDetail> {
    const { data } = await apiClient.get<CourseDetail>(`/courses/${slug}/`);
    return data;
  },

  async listCoaches(search?: string): Promise<Paginated<CoachPublic>> {
    const { data } = await apiClient.get<Paginated<CoachPublic>>("/coaches/", {
      params: search ? { search } : undefined,
    });
    return data;
  },

  async getCoach(id: number): Promise<CoachPublic> {
    const { data } = await apiClient.get<CoachPublic>(`/coaches/${id}/`);
    return data;
  },
};
