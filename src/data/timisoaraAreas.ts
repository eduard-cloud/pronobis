export type AreaPreset = { label: string; lat: number; lng: number };

/** Timișoara districts + nearby communes, since most of the community lives
 * in or around Timișoara. Shown as quick-pick chips in the location step. */
export const TIMISOARA_AREAS: AreaPreset[] = [
  { label: 'Cetate', lat: 45.7537, lng: 21.2257 },
  { label: 'Fabric', lat: 45.759, lng: 21.238 },
  { label: 'Iosefin', lat: 45.748, lng: 21.203 },
  { label: 'Elisabetin', lat: 45.74, lng: 21.213 },
  { label: 'Dumbrăvița', lat: 45.7975, lng: 21.2325 },
  { label: 'Giroc', lat: 45.7091, lng: 21.2394 },
  { label: 'Moșnița Nouă', lat: 45.7168, lng: 21.3153 },
  { label: 'Șag', lat: 45.6857, lng: 21.1758 },
];

export const TIMISOARA_CENTER = { lat: 45.7489, lng: 21.2087 };
