import { useState } from "react";

import { coachSlug } from "../lib/coach";
import type { CoachPublic } from "../types/courses";

/** Fills its container with the coach's portrait.
 *
 *  Three sources, in order: whatever the API returns on the profile, then a
 *  local file by name slug, then the initials. The initials are not a
 *  placeholder to be ashamed of — they get the volt gradient treatment so a
 *  coach without a photo still reads as a deliberate card, not a gap. */
export function CoachPortrait({
  coach,
  className = "",
}: {
  coach: CoachPublic;
  className?: string;
}) {
  const apiPhoto = coach.coach_profile?.photo ?? null;
  const [src, setSrc] = useState<string | null>(
    apiPhoto ?? `/images/coaches/${coachSlug(coach.full_name)}.webp`,
  );

  const initials = `${coach.first_name.charAt(0)}${coach.last_name.charAt(0)}`;

  return (
    <div className={`relative overflow-hidden bg-char-900 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={coach.full_name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          onError={() => {
            // Fall through to the initials rather than leaving a broken frame.
            if (apiPhoto && src === apiPhoto) {
              setSrc(`/images/coaches/${coachSlug(coach.full_name)}.webp`);
            } else {
              setSrc(null);
            }
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-char-800 via-char-900 to-char-950">
          <span className="bg-volt-ember bg-clip-text font-display text-5xl font-bold text-transparent">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}
