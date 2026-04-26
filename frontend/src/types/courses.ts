import type { CoachProfile } from "./auth";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
  course_count: number;
}

export type CourseLevel = "beginner" | "intermediate" | "advanced" | "all";

export interface CourseListItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  category_slug: string;
  coach_name: string | null;
  level: CourseLevel;
  duration_minutes: number;
  capacity: number;
  price_unit: string;
  image: string | null;
  is_active: boolean;
}

export interface CoachPublic {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  coach_profile: CoachProfile | null;
}

export interface CourseDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: Category;
  coach: CoachPublic | null;
  level: CourseLevel;
  duration_minutes: number;
  capacity: number;
  price_unit: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CourseFilters {
  search?: string;
  category__slug?: string;
  level?: CourseLevel | "";
  coach?: number;
  ordering?: string;
}
