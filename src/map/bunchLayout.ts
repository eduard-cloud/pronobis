import type { Person } from '../types';

export const ADULT_SIZE = 44;
export const CHILD_SIZE = 32;

const VERTICAL_STEP_FACTOR = 0.65;
const HORIZONTAL_STEP_FACTOR = 0.72;
const JITTER_PX = 4;
const JITTER_DEG = 3;

export type BunchAvatar = {
  id: string;
  x: number;
  y: number;
  size: number;
  zIndex: number;
  rotation: number;
};

export type BunchLayout = {
  avatars: BunchAvatar[];
  width: number;
  height: number;
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function jitterFor(id: string): { dx: number; dy: number; rotation: number } {
  const h = hashString(id);
  const dx = (((h % 1000) / 1000) * 2 - 1) * JITTER_PX;
  const dy = ((((h >> 8) % 1000) / 1000) * 2 - 1) * JITTER_PX;
  const rotation = ((((h >> 16) % 1000) / 1000) * 2 - 1) * JITTER_DEG;
  return { dx, dy, rotation };
}

/** Adults on top, children below in rows of up to 3, each row overlapping the
 * one above by ~35%. Deterministic per-avatar jitter keeps it organic but stable. */
export function layoutBunch(people: Person[]): BunchLayout {
  const adults = people.filter((p) => p.relation === 'adult');
  const children = people.filter((p) => p.relation === 'child');

  const rows: Person[][] = [];
  if (adults.length > 0) rows.push(adults);
  for (let i = 0; i < children.length; i += 3) {
    rows.push(children.slice(i, i + 3));
  }
  if (rows.length === 0) return { avatars: [], width: 0, height: 0 };

  const avatars: BunchAvatar[] = [];
  let cursorY = 0;
  let maxHalfWidth = 0;
  let prevRowSize = 0;
  let counter = people.length;

  rows.forEach((row, rowIndex) => {
    const rowSize = row[0].relation === 'adult' ? ADULT_SIZE : CHILD_SIZE;
    if (rowIndex === 0) {
      cursorY = rowSize / 2;
    } else {
      cursorY += ((prevRowSize + rowSize) / 2) * VERTICAL_STEP_FACTOR;
    }

    const rowWidth = (row.length - 1) * rowSize * HORIZONTAL_STEP_FACTOR;
    const startX = -rowWidth / 2;

    row.forEach((person, i) => {
      const { dx, dy, rotation } = jitterFor(person.id);
      const x = startX + i * rowSize * HORIZONTAL_STEP_FACTOR + dx;
      const y = cursorY + dy;
      avatars.push({ id: person.id, x, y, size: rowSize, zIndex: counter, rotation });
      counter--;
      maxHalfWidth = Math.max(maxHalfWidth, Math.abs(x) + rowSize / 2);
    });

    prevRowSize = rowSize;
  });

  const height = cursorY + prevRowSize / 2 + JITTER_PX;
  const width = maxHalfWidth * 2 + JITTER_PX * 2;

  const centeredAvatars = avatars.map((a) => ({ ...a, x: a.x + width / 2 }));

  return { avatars: centeredAvatars, width, height };
}
