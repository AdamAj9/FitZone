import { apiClient } from "./client";
import type {
  MyStats,
  QuestionnairePayload,
  QuestionnaireResponse,
  RecommendationsResponse,
} from "../types/me";

export const meApi = {
  async stats(): Promise<MyStats> {
    const { data } = await apiClient.get<MyStats>("/me/stats/");
    return data;
  },

  async recommendations(): Promise<RecommendationsResponse> {
    const { data } = await apiClient.get<RecommendationsResponse>(
      "/me/recommendations/",
    );
    return data;
  },

  async submitQuestionnaire(
    payload: QuestionnairePayload,
  ): Promise<QuestionnaireResponse> {
    const { data } = await apiClient.patch<QuestionnaireResponse>(
      "/auth/me/questionnaire/",
      payload,
    );
    return data;
  },
};
