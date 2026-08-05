import type { CityCenter } from '../data/romaniaCities';
import { renderGlyph } from './glyph';
import './eventMarker.css';

/** Country-zoom summary: one bubble per city carrying its event count, with
 * the city name as a small label underneath. This is the entire national
 * picture at that zoom tier — about eight objects for the whole country. */
export function createCityBubbleElement(city: CityCenter, count: number, onClick: () => void): HTMLElement {
  const el = document.createElement('div');
  el.className = 'city-bubble-icon';

  const wrap = document.createElement('div');
  wrap.className = 'city-bubble';

  const pill = document.createElement('div');
  pill.className = 'city-bubble__pill';

  const glyph = document.createElement('span');
  glyph.className = 'city-bubble__glyph';
  glyph.innerHTML = renderGlyph('SFBuilding2Fill', 16);
  pill.appendChild(glyph);

  const count_ = document.createElement('span');
  count_.className = 'city-bubble__count';
  count_.textContent = String(count);
  pill.appendChild(count_);

  const label = document.createElement('span');
  label.className = 'city-bubble__label';
  label.textContent = city.label;

  wrap.appendChild(pill);
  wrap.appendChild(label);
  el.appendChild(wrap);
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
}
