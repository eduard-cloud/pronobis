import type { EventCategory } from '../types';
import { EVENT_CATEGORIES } from '../data/eventCategories';
import { renderGlyph } from './glyph';
import './eventMarker.css';

/** Renders an event cluster as a squircle carrying the majority category's
 * glyph plus a total count — mirrors the person-cluster peek pattern but
 * summarizes by category instead of showing faces, since event pins don't
 * have photos. */
export function createEventClusterMarkerElement(
  dominantCategory: EventCategory,
  total: number,
  onClick: () => void
): HTMLElement {
  const meta = EVENT_CATEGORIES[dominantCategory];

  const el = document.createElement('div');
  el.className = 'event-cluster-icon';

  const inner = document.createElement('div');
  inner.className = 'event-cluster';
  inner.style.background = meta.fill;
  inner.style.color = meta.glyphColor;

  const glyph = document.createElement('span');
  glyph.className = 'event-cluster__glyph';
  glyph.innerHTML = renderGlyph(meta.glyph, 18);
  inner.appendChild(glyph);

  const count = document.createElement('span');
  count.className = 'event-cluster__count';
  count.textContent = `+${total}`;
  inner.appendChild(count);

  el.appendChild(inner);
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
}
