import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { usePeople } from '../data/store';
import { FamilyBunchMarker } from '../map/FamilyBunchMarker';
import type { Person } from '../types';
import { MAPBOX_TILE_URL } from '../config';
import './MapView.css';

type Props = {
  onSelectPerson: (id: string) => void;
};

function FitBounds({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [56, 56] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function MapView({ onSelectPerson }: Props) {
  const { people, households } = usePeople();

  const householdGroups = useMemo(
    () =>
      households
        .map((household) => ({
          household,
          members: household.memberIds
            .map((id) => people.find((p) => p.id === id))
            .filter((p): p is Person => p !== undefined && p.location !== null),
        }))
        .filter((g) => g.members.length > 0),
    [people, households]
  );

  const bounds = useMemo(() => {
    const points = householdGroups
      .map((g) => g.members[0].location)
      .filter((l): l is NonNullable<Person['location']> => Boolean(l))
      .map((l) => [l.lat, l.lng] as [number, number]);
    if (points.length === 0) return null;
    return L.latLngBounds(points);
  }, [householdGroups]);

  return (
    <div className="map-view">
      <MapContainer
        center={[45.9432, 24.9668]}
        zoom={7}
        className="map-view__map"
        zoomControl={false}
      >
        <TileLayer
          url={MAPBOX_TILE_URL}
          tileSize={256}
          detectRetina
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {bounds && <FitBounds bounds={bounds} />}
        {householdGroups.map(({ household, members }) => (
          <FamilyBunchMarker
            key={household.id}
            household={household}
            members={members}
            onSelectPerson={onSelectPerson}
          />
        ))}
      </MapContainer>
    </div>
  );
}
