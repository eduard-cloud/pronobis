import type { CommunityEvent } from '../types';
import { EVENT_CATEGORIES } from '../data/eventCategories';
import { renderGlyph } from './glyph';
import './eventMarker.css';

const TILE_SIZE = 44;

/** Builds the plain DOM element used as a mapbox-gl Marker for one event.
 * `live` is decided by the caller (MapView caps the pulse to the 5 pins
 * nearest viewport center) rather than recomputed here. */
export function createEventMarkerElement(
  event: CommunityEvent,
  live: boolean,
  onSelect: (id: string) => void
): HTMLElement {
  const meta = EVENT_CATEGORIES[event.category];

  const el = document.createElement('div');
  el.className = 'event-marker-icon';

  const tile = document.createElement('div');
  tile.className = 'event-marker__tile' + (live ? ' event-marker__tile--live' : '');
  tile.style.width = `${TILE_SIZE}px`;
  tile.style.height = `${TILE_SIZE}px`;
  tile.style.background = meta.fill;
  tile.style.color = meta.glyphColor;
  if (live) tile.style.setProperty('--live-ring-color', meta.fill);

  const glyph = document.createElement('span');
  glyph.className = 'event-marker__glyph';
  glyph.innerHTML = renderGlyph(meta.glyph, 20);
  tile.appendChild(glyph);

  const tail = document.createElement('div');
  tail.className = 'event-marker__tail';
  tail.style.borderTopColor = meta.fill;

  el.appendChild(tile);
  el.appendChild(tail);
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onSelect(event.id);
  });

  return el;
}
