import { apiClient } from "./client";
import type { Rating, RatingPayload, RatingsPage } from "../types/ratings";

export const ratingsApi = {
  async listForCoach(coachId: number): Promise<RatingsPage> {
    const { data } = await apiClient.get<RatingsPage>("/ratings/", {
      params: { coach: coachId },
    });
    return data;
  },

  async listMine(): Promise<Rating[] | RatingsPage> {
    const { data } = await apiClient.get("/ratings/mine/");
    return data;
  },

  async create(payload: RatingPayload): Promise<Rating> {
    const { data } = await apiClient.post<Rating>("/ratings/", payload);
    return data;
  },

  async update(id: number, payload: Partial<RatingPayload>): Promise<Rating> {
    const { data } = await apiClient.patch<Rating>(`/ratings/${id}/`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/ratings/${id}/`);
  },
};
