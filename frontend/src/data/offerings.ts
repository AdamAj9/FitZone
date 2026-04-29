/** Static catalogue of FitZone facilities and offerings shown in the
 *  Header mega-menu and the home "Notre offre" section.
 *  These are not bound to backend Course Categories — they describe the
 *  physical installations on-site. The category links below redirect to
 *  the public catalogue with a slug filter when the offering maps to a
 *  course category, otherwise they fall back to /courses. */

export type OfferingGroup = {
  title: string;
  icon: string;
  image: string;
  items: OfferingItem[];
};

export type OfferingItem = {
  label: string;
  description: string;
  href: string;
};

export const OFFERINGS: OfferingGroup[] = [
  {
    title: "Salles de fitness",
    icon: "🏋️",
    image: "/images/facilities/Salle%20de%20musculation.png",
    items: [
      {
        label: "Salle mixte",
        description: "Plus de 80 machines, espace cardio + free weights.",
        href: "/courses?category=fitness",
      },
      {
        label: "Salle femmes only",
        description: "Espace dédié, encadrement féminin sur demande.",
        href: "/courses?category=fitness",
      },
      {
        label: "Musculation",
        description: "Plateaux de force, racks et bancs olympiques.",
        href: "/courses?category=musculation",
      },
    ],
  },
  {
    title: "Piscine 25 m",
    icon: "🏊",
    image: "/images/facilities/Piscine.png",
    items: [
      {
        label: "Nage libre",
        description: "4 lignes d'eau chauffées + couloir nage libre.",
        href: "/courses?category=piscine",
      },
      {
        label: "Aquagym",
        description: "Cours collectifs encadrés, plusieurs niveaux.",
        href: "/courses?category=piscine",
      },
      {
        label: "Cours de natation",
        description: "Apprentissage individuel ou en groupe.",
        href: "/courses?category=piscine",
      },
    ],
  },
  {
    title: "Spa & bien-être",
    icon: "♨️",
    image: "/images/facilities/Spa-hammam.png",
    items: [
      {
        label: "Hammam",
        description: "Vapeur eucalyptus, accès illimité aux abonnés Premium.",
        href: "/plans",
      },
      {
        label: "Sauna",
        description: "Cabines bois nordique, sessions de 15 min.",
        href: "/plans",
      },
      {
        label: "Espace détente",
        description: "Tisanes, lecture, après chaque séance.",
        href: "/plans",
      },
    ],
  },
  {
    title: "Tennis & raquette",
    icon: "🎾",
    image: "/images/facilities/Tennins%20indoor.png",
    items: [
      {
        label: "Tennis",
        description: "Courts intérieurs en résine, cours individuels et groupes.",
        href: "/courses?category=tennis",
      },
      {
        label: "Padel",
        description: "2 pistes panoramiques, équipement fourni.",
        href: "/courses",
      },
      {
        label: "Squash",
        description: "Courts homologués, créneaux disponibles 7j/7.",
        href: "/courses",
      },
    ],
  },
  {
    title: "Cours collectifs",
    icon: "🧘",
    image: "/images/facilities/Salle%20Yoga.png",
    items: [
      {
        label: "Yoga & Pilates",
        description: "Vinyasa, Hatha, Pilates Reformer.",
        href: "/courses?category=yoga",
      },
      {
        label: "Cycling",
        description: "Studio immersif, sessions rythmées en musique.",
        href: "/courses?category=cycling",
      },
      {
        label: "HIIT & Cross Training",
        description: "Format court, intensité maximale, encadré par un coach.",
        href: "/courses?category=fitness",
      },
    ],
  },
  {
    title: "Pro & coworking",
    icon: "💼",
    image: "/images/facilities/Lounge-coworking.png",
    items: [
      {
        label: "Espaces coworking",
        description: "WiFi haut débit, café à volonté, lounge sportif.",
        href: "/plans",
      },
      {
        label: "Salles de meeting",
        description: "Réservez à l'heure, écran 4K + visio Zoom.",
        href: "/plans",
      },
      {
        label: "Casiers premium",
        description: "Casiers personnels avec serrure connectée.",
        href: "/plans",
      },
    ],
  },
];
