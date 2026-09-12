/** Single source for the gym's public contact details.
 *
 *  The footer used to hardcode the phone and email while nothing else did;
 *  now the contact page and the footer read the same constants, so they
 *  cannot drift apart.
 *
 *  The address is fictional (this is a school project), so the map centres
 *  on central Brussels rather than geocoding a street that does not exist.
 */
export const CONTACT_INFO = {
  phone: "+32 2 555 12 34",
  phoneHref: "tel:+3225551234",
  email: "hello@fitzone.local",
  street: "42 rue de la Forme",
  city: "1000 Bruxelles",
  hours: {
    weekdays: "06:30 – 22:30",
    weekend: "08:00 – 20:00",
  },
  map: {
    lat: 50.8466,
    lon: 4.3528,
    /** OpenStreetMap embed: no API key, no tracking cookies. */
    embed:
      "https://www.openstreetmap.org/export/embed.html?bbox=4.3328%2C50.8386%2C4.3728%2C50.8546&layer=mapnik&marker=50.8466%2C4.3528",
    external: "https://www.google.com/maps/search/?api=1&query=50.8466,4.3528",
  },
} as const;
