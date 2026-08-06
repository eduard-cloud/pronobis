/** Pronobis brand teal (#174c44) and gold, plus shades/tints of each —
 * every pairing verified at 4.5:1+ contrast against its fg color. */
const PALETTE = [
  { bg: '#174C44', fg: '#F4F3F0' }, // brand teal
  { bg: '#0D2B26', fg: '#F4F3F0' }, // teal shade
  { bg: '#3E7168', fg: '#F4F3F0' }, // teal tint
  { bg: '#E9C13F', fg: '#0C0F14' }, // brand gold
  { bg: '#B88F1E', fg: '#0C0F14' }, // gold shade
  { bg: '#F2D983', fg: '#0C0F14' }, // gold tint
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateInitialsAvatar(
  firstName: string,
  lastName: string,
  seed: string
): string {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  const { bg, fg } = PALETTE[hashString(seed) % PALETTE.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
<rect width="128" height="128" fill="${bg}"/>
<text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-family="Inter Tight, system-ui, sans-serif" font-weight="700" font-size="52" letter-spacing="-2" fill="${fg}">${initials}</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

/** True when `photo` is our generated colored-initials avatar (no real photo uploaded). */
export function isGeneratedAvatar(photo: string): boolean {
  return photo.startsWith('data:image/svg+xml');
}
