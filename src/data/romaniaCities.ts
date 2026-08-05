export type CityCenter = { id: string; label: string; lat: number; lng: number };

/** The eight cities shown as count bubbles at country zoom. Timișoara gets
 * full street-level detail; the rest surface only as aggregate bubbles. */
export const ROMANIA_CITIES: CityCenter[] = [
  { id: 'bucuresti', label: 'București', lat: 44.4268, lng: 26.1025 },
  { id: 'cluj-napoca', label: 'Cluj-Napoca', lat: 46.7712, lng: 23.6236 },
  { id: 'iasi', label: 'Iași', lat: 47.1585, lng: 27.6014 },
  { id: 'timisoara', label: 'Timișoara', lat: 45.7489, lng: 21.2087 },
  { id: 'brasov', label: 'Brașov', lat: 45.6427, lng: 25.5887 },
  { id: 'constanta', label: 'Constanța', lat: 44.1598, lng: 28.6348 },
  { id: 'sibiu', label: 'Sibiu', lat: 45.7983, lng: 24.1256 },
  { id: 'oradea', label: 'Oradea', lat: 47.0722, lng: 21.9217 },
];

// Bounding box for the whole country, used to fit the map at the country tier.
export const ROMANIA_BOUNDS: [[number, number], [number, number]] = [
  [20.26, 43.6],
  [29.75, 48.27],
];
