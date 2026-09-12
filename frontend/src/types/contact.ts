export type ContactSubject =
  | "membership"
  | "classes"
  | "coaching"
  | "facilities"
  | "other";

export interface ContactPayload {
  first_name: string;
  last_name: string;
  email: string;
  subject: ContactSubject;
  message: string;
}
