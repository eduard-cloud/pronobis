const JITTER_RADIUS_METERS = 25;
const METERS_PER_DEGREE_LAT = 111320;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Deterministically nudges a person a few meters from their household's
 * shared coordinate, in a unique direction per person. Two people who'd
 * otherwise sit on the exact same point (same household, or two households
 * that picked the same neighborhood chip) end up close but distinct — so
 * the marker cluster group can space or spiderfy them like real pins
 * instead of one avatar hiding behind another. */
export function jitterLocation(
  lat: number,
  lng: number,
  seed: string
): { lat: number; lng: number } {
  const h = hashString(seed);
  const angle = (h % 360) * (Math.PI / 180);
  const radius = JITTER_RADIUS_METERS * (0.5 + ((h >> 9) % 500) / 1000);

  const dLat = (radius * Math.cos(angle)) / METERS_PER_DEGREE_LAT;
  const metersPerDegreeLng = METERS_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180);
  const dLng = (radius * Math.sin(angle)) / metersPerDegreeLng;

  return { lat: lat + dLat, lng: lng + dLng };
}
