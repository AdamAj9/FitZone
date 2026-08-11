/** Static catalogue of FitZone facilities and offerings shown in the
 *  Header mega-menu and the home "Notre offre" section.
 *  These are not bound to backend Course Categories — they describe the
 *  physical installations on-site. The category links below redirect to
 *  the public catalogue with a slug filter when the offering maps to a
 *  course category, otherwise they fall back to /courses.
 *  Titles/labels/descriptions live in the i18n locale files under
 *  "offerings.<groupKey>" — this file only holds the stable structure. */

export type OfferingItem = {
  key: string;
  href: string;
};

export type OfferingGroup = {
  key: string;
  icon: string;
  image: string;
  items: OfferingItem[];
};

export const OFFERINGS: OfferingGroup[] = [
  {
    key: "fitness",
    icon: "🏋️",
    image: "/images/facilities/Salle%20de%20musculation.png",
    items: [
      { key: "mixedRoom", href: "/courses?category=fitness" },
      { key: "womenOnlyRoom", href: "/courses?category=fitness" },
      { key: "weightTraining", href: "/courses?category=musculation" },
    ],
  },
  {
    key: "pool",
    icon: "🏊",
    image: "/images/facilities/Piscine.png",
    items: [
      { key: "freeSwim", href: "/courses?category=piscine" },
      { key: "aquagym", href: "/courses?category=piscine" },
      { key: "swimmingLessons", href: "/courses?category=piscine" },
    ],
  },
  {
    key: "spa",
    icon: "♨️",
    image: "/images/facilities/Spa-hammam.png",
    items: [
      { key: "hammam", href: "/plans" },
      { key: "sauna", href: "/plans" },
      { key: "relaxArea", href: "/plans" },
    ],
  },
  {
    key: "tennis",
    icon: "🎾",
    image: "/images/facilities/Tennins%20indoor.png",
    items: [
      { key: "tennis", href: "/courses?category=tennis" },
      { key: "padel", href: "/courses" },
      { key: "squash", href: "/courses" },
    ],
  },
  {
    key: "groupClasses",
    icon: "🧘",
    image: "/images/facilities/Salle%20Yoga.png",
    items: [
      { key: "yogaPilates", href: "/courses?category=yoga" },
      { key: "cycling", href: "/courses?category=cycling" },
      { key: "hiit", href: "/courses?category=fitness" },
    ],
  },
  {
    key: "coworking",
    icon: "💼",
    image: "/images/facilities/Lounge-coworking.png",
    items: [
      { key: "coworkingSpaces", href: "/plans" },
      { key: "meetingRooms", href: "/plans" },
      { key: "premiumLockers", href: "/plans" },
    ],
  },
];
