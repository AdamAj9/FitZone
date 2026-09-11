/** "Léo Durand" -> "leo-durand". Used to look up a coach's local portrait,
 *  the same convention the course images already follow. */
export function coachSlug(fullName: string) {
  return fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
