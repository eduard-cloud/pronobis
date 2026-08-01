import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import L from 'leaflet';
import { usePeople } from '../data/store';
import { PersonMarker } from '../map/PersonMarker';
import { createClusterIcon } from '../map/clusterIcon';
import { TIMISOARA_CENTER } from '../data/timisoaraAreas';
import type { Person } from '../types';
import { MAPBOX_TILE_URL } from '../config';
import '../map/clusterIcon.css';
import './MapView.css';

type Props = {
  query: string;
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

export function MapView({ query, onSelectPerson }: Props) {
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

  // Children stay off the map for privacy — they're still visible inside a
  // parent's sheet under Connected people, and always in List view.
  const visibleAdults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matching = q
      ? householdGroups.filter(
          ({ household, members }) =>
            household.label.toLowerCase().includes(q) ||
            members.some((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q))
        )
      : householdGroups;
    return matching.flatMap((g) => g.members.filter((p) => p.relation === 'adult'));
  }, [householdGroups, query]);

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
        center={[TIMISOARA_CENTER.lat, TIMISOARA_CENTER.lng]}
        zoom={12}
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
        <MarkerClusterGroup
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={35}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
        >
          {visibleAdults.map((person) => (
            <PersonMarker key={person.id} person={person} onSelectPerson={onSelectPerson} />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
