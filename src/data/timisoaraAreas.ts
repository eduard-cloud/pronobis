export type AreaPreset = { label: string; lat: number; lng: number };

/** Every official Timișoara district plus the nearby communes most of the
 * community actually lives in. Coordinates geocoded via OpenStreetMap
 * Nominatim. Shown as quick-pick chips in the location step. */
export const TIMISOARA_AREAS: AreaPreset[] = [
  { label: 'Cetate', lat: 45.756, lng: 21.2288 },
  { label: 'Fabric', lat: 45.757, lng: 21.2499 },
  { label: 'Iosefin', lat: 45.7442, lng: 21.2091 },
  { label: 'Elisabetin', lat: 45.7416, lng: 21.2256 },
  { label: 'Mehala', lat: 45.7642, lng: 21.2041 },
  { label: 'Freidorf', lat: 45.7271, lng: 21.1806 },
  { label: 'Ronaț', lat: 45.7567, lng: 21.1873 },
  { label: 'Circumvalațiunii', lat: 45.7593, lng: 21.214 },
  { label: 'Girocului', lat: 45.7318, lng: 21.2319 },
  { label: 'Aradului', lat: 45.7804, lng: 21.2199 },
  { label: 'Torontalului', lat: 45.7736, lng: 21.212 },
  { label: 'Lipovei', lat: 45.7732, lng: 21.2318 },
  { label: 'Șagului', lat: 45.722, lng: 21.2001 },
  { label: 'Ciarda Roșie', lat: 45.7274, lng: 21.2672 },
  { label: 'Plopi', lat: 45.7499, lng: 21.2799 },
  { label: 'Kuncz', lat: 45.7469, lng: 21.2672 },
  { label: 'Soarelui', lat: 45.7341, lng: 21.2487 },
  { label: 'Steaua', lat: 45.7235, lng: 21.2041 },
  { label: 'Braytim', lat: 45.726, lng: 21.2414 },
  { label: 'Fratelia', lat: 45.7236, lng: 21.2147 },
  { label: 'Zona Lunei', lat: 45.7518, lng: 21.2575 },
  { label: 'Dâmbovița', lat: 45.734, lng: 21.1986 },
  { label: 'Modern', lat: 45.7663, lng: 21.2697 },
  { label: 'Blașcovici', lat: 45.7555, lng: 21.2007 },
  { label: 'Dumbrăvița', lat: 45.7847, lng: 21.2358 },
  { label: 'Giroc', lat: 45.715, lng: 21.2198 },
  { label: 'Moșnița Nouă', lat: 45.7188, lng: 21.3259 },
  { label: 'Șag', lat: 45.6924, lng: 21.1672 },
  { label: 'Sânandrei', lat: 45.8551, lng: 21.1677 },
];

export const TIMISOARA_CENTER = { lat: 45.7489, lng: 21.2087 };
