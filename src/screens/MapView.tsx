import { useEffect, useMemo, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FeatureCollection, Point } from 'geojson';
import { usePeople } from '../data/store';
import { createPersonMarkerElement } from '../map/PersonMarker';
import { createClusterMarkerElement } from '../map/clusterIcon';
import { jitterLocation } from '../map/geoJitter';
import { TIMISOARA_CENTER } from '../data/timisoaraAreas';
import type { Person } from '../types';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URL } from '../config';
import '../map/clusterIcon.css';
import './MapView.css';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const SOURCE_ID = 'people';
const PEEK_COUNT = 2;

// Person avatars and cluster peeks grow/shrink with zoom instead of
// staying a fixed pixel size, so the map reads as more alive when
// scrolling/pinching to zoom.
const SCALE_BASE_ZOOM = 12;
const SCALE_MIN = 0.65;
const SCALE_MAX = 1.9;
const SCALE_SENSITIVITY = 0.14;

function scaleForZoom(zoom: number): number {
  const raw = 1 + (zoom - SCALE_BASE_ZOOM) * SCALE_SENSITIVITY;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, raw));
}

function applyMarkerScale(el: HTMLElement, scale: number) {
  const target = el.querySelector<HTMLElement>('.person-marker__avatar, .map-cluster');
  target?.style.setProperty('--zoom-scale', String(scale));
}

type Props = {
  query: string;
  onSelectPerson: (id: string) => void;
};

type PersonProperties = { personId: string; firstName: string; photo: string };

function toFeatureCollection(people: Person[]): FeatureCollection<Point, PersonProperties> {
  return {
    type: 'FeatureCollection',
    features: people
      .filter((p) => p.location !== null)
      .map((p) => {
        const jittered = jitterLocation(p.location!.lat, p.location!.lng, p.id);
        return {
          type: 'Feature',
          properties: { personId: p.id, firstName: p.firstName, photo: p.photo },
          geometry: { type: 'Point', coordinates: [jittered.lng, jittered.lat] },
        };
      }),
  };
}

export function MapView({ query, onSelectPerson }: Props) {
  const { people, households } = usePeople();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());
  const onSelectPersonRef = useRef(onSelectPerson);
  onSelectPersonRef.current = onSelectPerson;
  const visibleAdultsRef = useRef<Person[]>([]);

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
  visibleAdultsRef.current = visibleAdults;

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE_URL,
      center: [TIMISOARA_CENTER.lng, TIMISOARA_CENTER.lat],
      zoom: 12,
    });
    mapRef.current = map;

    map.on('load', () => {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: toFeatureCollection(visibleAdultsRef.current),
        cluster: true,
        clusterRadius: 35,
        clusterMaxZoom: 20,
      });

      // Invisible layers: mapbox-gl only evaluates a source's clustering
      // and makes it queryable once at least one layer renders from it.
      // The real visuals are the HTML mapboxgl.Marker elements below.
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: { 'circle-radius': 1, 'circle-opacity': 0 },
      });
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: { 'circle-radius': 1, 'circle-opacity': 0 },
      });

      updateMarkers();

      const bounds = boundsFromHouseholds();
      if (bounds) map.fitBounds(bounds, { padding: 56, duration: 0 });

      map.on('render', () => {
        // React StrictMode double-mounts in dev, tearing the first map
        // down before its style finishes loading — a stray 'render' from
        // that torn-down instance can race this check, so guard instead
        // of trusting isSourceLoaded not to throw on a removed map.
        try {
          if (!map.getSource(SOURCE_ID) || !map.isSourceLoaded(SOURCE_ID)) return;
        } catch {
          return;
        }
        updateMarkers();
      });

      map.on('zoom', () => {
        const scale = scaleForZoom(map.getZoom());
        for (const marker of markersRef.current.values()) {
          applyMarkerScale(marker.getElement(), scale);
        }
      });
    });

    function boundsFromHouseholds(): mapboxgl.LngLatBoundsLike | null {
      const points = householdGroups
        .map((g) => g.members[0].location)
        .filter((l): l is NonNullable<Person['location']> => Boolean(l))
        .map((l) => [l.lng, l.lat] as [number, number]);
      if (points.length === 0) return null;
      const bounds = new mapboxgl.LngLatBounds();
      points.forEach((p) => bounds.extend(p));
      return bounds;
    }

    function updateMarkers() {
      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
      if (!source) return;

      const features = map.querySourceFeatures(SOURCE_ID);
      const seen = new Set<string>();

      for (const feature of features) {
        const coords = (feature.geometry as Point).coordinates as [number, number];
        const props = feature.properties as (PersonProperties & { cluster?: boolean; cluster_id?: number; point_count?: number }) | null;
        if (!props) continue;

        if (props.cluster) {
          const clusterId = props.cluster_id!;
          const id = `cluster-${clusterId}`;
          if (seen.has(id)) continue;
          seen.add(id);

          const existing = markersRef.current.get(id);
          if (existing) {
            existing.setLngLat(coords);
            continue;
          }
          if (pendingRef.current.has(id)) continue;
          pendingRef.current.add(id);

          source.getClusterLeaves(clusterId, PEEK_COUNT, 0, (err, leaves) => {
            pendingRef.current.delete(id);
            if (err || !leaves || markersRef.current.has(id)) return;
            const peek = leaves.map((l) => l.properties as PersonProperties);
            const el = createClusterMarkerElement(peek, props.point_count ?? peek.length, () => {
              source.getClusterExpansionZoom(clusterId, (zoomErr, zoom) => {
                if (zoomErr || zoom == null) return;
                map.easeTo({ center: coords, zoom });
              });
            });
            const marker = new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map);
            applyMarkerScale(el, scaleForZoom(map.getZoom()));
            markersRef.current.set(id, marker);
          });
        } else {
          const id = `person-${props.personId}`;
          if (seen.has(id)) continue;
          seen.add(id);

          const existing = markersRef.current.get(id);
          if (existing) {
            existing.setLngLat(coords);
            continue;
          }
          const el = createPersonMarkerElement(
            { id: props.personId, firstName: props.firstName, photo: props.photo } as Person,
            (personId) => onSelectPersonRef.current(personId)
          );
          const marker = new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map);
          applyMarkerScale(el, scaleForZoom(map.getZoom()));
          markersRef.current.set(id, marker);
        }
      }

      for (const [id, marker] of markersRef.current) {
        if (!seen.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      }
    }

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push updated people into the source whenever the filtered list changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(toFeatureCollection(visibleAdults));
  }, [visibleAdults]);

  return (
    <div className="map-view">
      <div ref={containerRef} className="map-view__map" />
    </div>
  );
}
