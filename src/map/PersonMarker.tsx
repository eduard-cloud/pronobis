import L from 'leaflet';
import { Marker } from 'react-leaflet';
import type { Person } from '../types';
import { jitterLocation } from './geoJitter';
import './personMarker.css';

const AVATAR_SIZE = 44;

type Props = {
  person: Person;
  onSelectPerson: (id: string) => void;
};

export function PersonMarker({ person, onSelectPerson }: Props) {
  const location = person.location;
  if (!location) return null;

  const jittered = jitterLocation(location.lat, location.lng, person.id);

  const icon = L.divIcon({
    html: `<img
      src="${person.photo}"
      alt=""
      class="person-marker__avatar"
      style="width:${AVATAR_SIZE}px;height:${AVATAR_SIZE}px;"
    />`,
    className: 'person-marker-icon',
    iconSize: [AVATAR_SIZE, AVATAR_SIZE],
    iconAnchor: [AVATAR_SIZE / 2, AVATAR_SIZE / 2],
  });

  return (
    <Marker
      position={[jittered.lat, jittered.lng]}
      icon={icon}
      alt={person.firstName}
      ref={(marker) => {
        if (marker) (marker.options as { clusterMembers?: Person[] }).clusterMembers = [person];
      }}
      eventHandlers={{
        click: () => onSelectPerson(person.id),
      }}
    />
  );
}
