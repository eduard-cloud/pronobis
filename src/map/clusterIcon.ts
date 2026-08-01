import type { Person } from '../types';

const AVATAR_SIZE = 34;
const OVERLAP = 22;

type PeekPerson = Pick<Person, 'firstName' | 'photo'>;

/** Renders a cluster the way Snapchat's map does: a peek of up to two real
 * avatar photos, overlapped, plus a "+N" badge for everyone else in the
 * cluster. */
export function createClusterMarkerElement(
  peek: PeekPerson[],
  total: number,
  onClick: () => void
): HTMLElement {
  const overflow = total - peek.length;
  const slots = peek.length || 1;
  const width = AVATAR_SIZE + (slots - 1) * OVERLAP + (overflow > 0 ? OVERLAP : 0);

  const el = document.createElement('div');
  el.className = 'map-cluster-icon';

  const inner = document.createElement('div');
  inner.className = 'map-cluster';
  inner.style.width = `${width}px`;
  inner.style.height = `${AVATAR_SIZE}px`;

  peek.forEach((p, i) => {
    const img = document.createElement('img');
    img.src = p.photo;
    img.alt = p.firstName;
    img.className = 'map-cluster__avatar';
    img.style.width = `${AVATAR_SIZE}px`;
    img.style.height = `${AVATAR_SIZE}px`;
    img.style.left = `${i * OVERLAP}px`;
    img.style.zIndex = String(10 - i);
    inner.appendChild(img);
  });

  if (overflow > 0) {
    const badge = document.createElement('div');
    badge.className = 'map-cluster__badge';
    badge.style.width = `${AVATAR_SIZE}px`;
    badge.style.height = `${AVATAR_SIZE}px`;
    badge.style.left = `${peek.length * OVERLAP}px`;
    badge.style.zIndex = String(10 - peek.length);
    badge.textContent = `+${overflow}`;
    inner.appendChild(badge);
  }

  el.appendChild(inner);
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
}
