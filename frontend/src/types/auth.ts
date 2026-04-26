export type Role = "member" | "coach" | "admin";

export interface MemberProfile {
  date_of_birth: string | null;
  level: "beginner" | "intermediate" | "advanced";
  goals: string;
  preferences: Record<string, unknown>;
  questionnaire_completed: boolean;
}

export interface CoachProfile {
  bio: string;
  specialties: string;
  specialties_list: string[];
  years_of_experience: number;
  photo: string | null;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: Role;
  phone: string;
  preferred_language: "fr" | "en";
  date_joined: string;
  member_profile?: MemberProfile | null;
  coach_profile?: CoachProfile | null;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  preferred_language?: "fr" | "en";
}
