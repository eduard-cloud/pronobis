import type { Person } from '../types';
import './personMarker.css';

export const AVATAR_SIZE = 56;

/** Builds the plain DOM element used as a mapbox-gl Marker for one person. */
export function createPersonMarkerElement(person: Person, onSelect: (id: string) => void): HTMLElement {
  const img = document.createElement('img');
  img.src = person.photo;
  img.alt = '';
  img.className = 'person-marker__avatar';
  img.style.width = `${AVATAR_SIZE}px`;
  img.style.height = `${AVATAR_SIZE}px`;

  const el = document.createElement('div');
  el.className = 'person-marker-icon';
  el.appendChild(img);
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onSelect(person.id);
  });

  return el;
}
