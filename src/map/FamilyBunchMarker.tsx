import L from 'leaflet';
import { Marker } from 'react-leaflet';
import type { Household, Person } from '../types';
import { layoutBunch } from './bunchLayout';
import './bunch.css';

type Props = {
  household: Household;
  members: Person[];
  onSelectPerson: (id: string) => void;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function FamilyBunchMarker({ household, members, onSelectPerson }: Props) {
  const location = members[0]?.location;
  if (!location) return null;

  const layout = layoutBunch(members);
  if (layout.avatars.length === 0) return null;

  const membersById = new Map(members.map((m) => [m.id, m]));

  const avatarsHtml = layout.avatars
    .map((a) => {
      const person = membersById.get(a.id);
      if (!person) return '';
      return `<img
        src="${person.photo}"
        alt="${escapeHtml(person.firstName)}"
        data-person-id="${person.id}"
        class="family-bunch__avatar"
        style="width:${a.size}px;height:${a.size}px;left:${a.x - a.size / 2}px;top:${a.y - a.size / 2}px;z-index:${a.zIndex};transform:rotate(${a.rotation}deg);"
      />`;
    })
    .join('');

  const html = `<div class="family-bunch" style="width:${layout.width}px;height:${layout.height}px;">${avatarsHtml}</div>`;

  const icon = L.divIcon({
    html,
    className: 'family-bunch-icon',
    iconSize: [layout.width, layout.height],
    iconAnchor: [layout.width / 2, layout.height],
  });

  return (
    <Marker
      position={[location.lat, location.lng]}
      icon={icon}
      alt={household.label}
      eventHandlers={{
        click: (e) => {
          const target = e.originalEvent.target as HTMLElement;
          const personId = target.closest('[data-person-id]')?.getAttribute('data-person-id');
          onSelectPerson(personId ?? members[0].id);
        },
      }}
    />
  );
}
