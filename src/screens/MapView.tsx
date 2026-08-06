import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FeatureCollection, Point } from 'geojson';
import { usePeople } from '../data/store';
import { events as allEvents } from '../data/events';
import { EVENT_CATEGORIES } from '../data/eventCategories';
import { matchesBucket, type TimeBucket } from '../utils/eventTime';
import { createPersonMarkerElement, AVATAR_SIZE } from '../map/PersonMarker';
import { createClusterMarkerElement } from '../map/clusterIcon';
import { createEventMarkerElement } from '../map/EventMarker';
import { createEventClusterMarkerElement } from '../map/eventClusterIcon';
import { createCityBubbleElement } from '../map/cityBubble';
import { jitterLocation } from '../map/geoJitter';
import { TIMISOARA_CENTER } from '../data/timisoaraAreas';
import { ROMANIA_CITIES } from '../data/romaniaCities';
import type { CommunityEvent, EventCategory, Person } from '../types';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URL } from '../config';
import { MapModeSwitch, type MapMode } from '../components/MapModeSwitch';
import { TimeFilter } from '../components/TimeFilter';
import '../map/clusterIcon.css';
import '../map/eventMarker.css';
import './MapView.css';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const PEOPLE_SOURCE_ID = 'people';
const EVENTS_SOURCE_ID = 'events';
const PEEK_COUNT = 2;
const CATEGORY_SAMPLE_LIMIT = 200;

// Below this zoom the whole country is summarized as one bubble per city —
// tens of individual/clustered pins would be unreadable confetti at this
// scale. Above clusterMaxZoom, the events source stops clustering, so the
// "region" and "street" tiers share one query code path; only the country
// tier needs a different data path (direct aggregation, no map source).
const COUNTRY_ZOOM_MAX = 8.5;
const EVENTS_CLUSTER_MAX_ZOOM = 13;

// Never let more than this many event pins pulse at once — motion stops
// being a signal ("this is happening right now") once it's everywhere.
const MAX_LIVE_PULSES = 5;

type LayerTier = 'country' | 'region' | 'street';

function tierForZoom(zoom: number): LayerTier {
  if (zoom < COUNTRY_ZOOM_MAX) return 'country';
  if (zoom <= EVENTS_CLUSTER_MAX_ZOOM) return 'region';
  return 'street';
}

// Mapbox GL's supercluster freezes a cluster's membership at clusterMaxZoom —
// zooming in further just keeps returning whatever grouping existed at that
// zoom, forever, even if two people's jittered coordinates only barely
// touched by chance. That made small clusters "stick" indefinitely once
// formed, well past the zoom where they should've split into individual
// pins. So instead of leaning on Mapbox's cluster freeze to decide when
// people render individually, we do it ourselves: once the camera is this
// close, clustering is bypassed entirely and every visible person gets
// their own marker, positioned by declutterMarkers() below. Below this
// zoom, the map still shows real cluster bubbles for a genuinely zoomed-out
// view — the Snapchat-style "group of dots" is fine there.
const EXPAND_ZOOM_THRESHOLD = 15;

// Person avatars, event tiles, and cluster peeks all grow/shrink with zoom
// instead of staying a fixed pixel size, so the map reads as more alive
// when scrolling/pinching to zoom.
const SCALE_BASE_ZOOM = 12;
const SCALE_MIN = 0.65;
const SCALE_MAX = 1.9;
const SCALE_SENSITIVITY = 0.14;

function scaleForZoom(zoom: number): number {
  const raw = 1 + (zoom - SCALE_BASE_ZOOM) * SCALE_SENSITIVITY;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, raw));
}

function applyMarkerScale(el: HTMLElement, scale: number) {
  const target = el.querySelector<HTMLElement>(
    '.person-marker__avatar, .map-cluster, .event-marker__tile, .event-cluster, .city-bubble'
  );
  target?.style.setProperty('--zoom-scale', String(scale));
}

function isLiveNow(event: CommunityEvent): boolean {
  const now = Date.now();
  return now >= new Date(event.startsAt).getTime() && now <= new Date(event.endsAt).getTime();
}

function distanceSq(a: mapboxgl.LngLat, b: [number, number]): number {
  const dLng = a.lng - b[0];
  const dLat = a.lat - b[1];
  return dLng * dLng + dLat * dLat;
}

// Minimum breathing room between two avatar edges, in pixels, once decluttered.
const DECLUTTER_GAP = 8;

function hashPair(a: string, b: string): number {
  const str = a < b ? `${a}|${b}` : `${b}|${a}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

type Props = {
  query: string;
  onSelectPerson: (id: string) => void;
  onSelectEvent: (id: string) => void;
  mode: MapMode;
  onModeChange: (mode: MapMode) => void;
};

type PersonProperties = { personId: string; firstName: string; photo: string };
type EventProperties = { eventId: string; category: EventCategory };

function toPersonFeatureCollection(people: Person[]): FeatureCollection<Point, PersonProperties> {
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

function toEventFeatureCollection(list: CommunityEvent[]): FeatureCollection<Point, EventProperties> {
  return {
    type: 'FeatureCollection',
    features: list.map((e) => ({
      type: 'Feature',
      properties: { eventId: e.id, category: e.category },
      geometry: { type: 'Point', coordinates: [e.location.lng, e.location.lat] },
    })),
  };
}

export function MapView({ query, onSelectPerson, onSelectEvent, mode, onModeChange }: Props) {
  const { people, households } = usePeople();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());
  const onSelectPersonRef = useRef(onSelectPerson);
  onSelectPersonRef.current = onSelectPerson;
  const onSelectEventRef = useRef(onSelectEvent);
  onSelectEventRef.current = onSelectEvent;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const visibleAdultsRef = useRef<Person[]>([]);
  const visibleEventsRef = useRef<CommunityEvent[]>([]);
  const updateMarkersRef = useRef<() => void>(() => {});

  // Default "This week" — bucketing by time is the real overload control
  // for a national events map.
  const [timeBucket, setTimeBucket] = useState<TimeBucket>('week');

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

  const queryMatchedEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allEvents;
    return allEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        EVENT_CATEGORIES[e.category].label.toLowerCase().includes(q)
    );
  }, [query]);

  const visibleEvents = useMemo(
    () => queryMatchedEvents.filter((e) => matchesBucket(e, timeBucket)),
    [queryMatchedEvents, timeBucket]
  );
  visibleEventsRef.current = visibleEvents;

  const timeBucketCounts = useMemo(
    () => ({
      now: queryMatchedEvents.filter((e) => matchesBucket(e, 'now')).length,
      today: queryMatchedEvents.filter((e) => matchesBucket(e, 'today')).length,
      week: queryMatchedEvents.filter((e) => matchesBucket(e, 'week')).length,
    }),
    [queryMatchedEvents]
  );

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
      map.addSource(PEOPLE_SOURCE_ID, {
        type: 'geojson',
        data: toPersonFeatureCollection(visibleAdultsRef.current),
        cluster: true,
        clusterRadius: 35,
        // Only relevant below EXPAND_ZOOM_THRESHOLD — updatePeopleMarkers()
        // bypasses this source's clustering above that zoom (see comment
        // there), so this just needs to stay under the threshold.
        clusterMaxZoom: 14,
      });
      map.addSource(EVENTS_SOURCE_ID, {
        type: 'geojson',
        data: toEventFeatureCollection(visibleEventsRef.current),
        cluster: true,
        clusterRadius: 40,
        clusterMaxZoom: EVENTS_CLUSTER_MAX_ZOOM,
      });

      // Invisible layers: mapbox-gl only evaluates a source's clustering
      // and makes it queryable once at least one layer renders from it.
      // The real visuals are the HTML mapboxgl.Marker elements below.
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: PEOPLE_SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: { 'circle-radius': 1, 'circle-opacity': 0 },
      });
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: PEOPLE_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: { 'circle-radius': 1, 'circle-opacity': 0 },
      });
      map.addLayer({
        id: 'event-clusters',
        type: 'circle',
        source: EVENTS_SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: { 'circle-radius': 1, 'circle-opacity': 0 },
      });
      map.addLayer({
        id: 'event-unclustered-point',
        type: 'circle',
        source: EVENTS_SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: { 'circle-radius': 1, 'circle-opacity': 0 },
      });

      updateMarkers();

      const bounds = boundsFromHouseholds();
      if (bounds) map.fitBounds(bounds, { padding: 56, duration: 0 });

      // Reconcile markers once a pan/zoom gesture settles, rather than on
      // every 'render' frame: querying a clustered source mid-gesture races
      // tile loading and can transiently return no features, which was
      // deleting markers while dragging and sometimes leaving them gone
      // for good. mapboxgl.Marker already repositions existing markers
      // every frame on its own, so live dragging stays smooth regardless.
      // The events source hooks this exact same lifecycle for the exact
      // same reason — a naively-added second source would reintroduce the
      // disappearing-marker bug this guard was written to fix.
      const reconcileMarkers = () => {
        // React StrictMode double-mounts in dev, tearing the first map
        // down before its style finishes loading — a stray event from
        // that torn-down instance can race this check, so guard instead
        // of trusting isSourceLoaded not to throw on a removed map.
        try {
          if (!map.getSource(PEOPLE_SOURCE_ID) || !map.isSourceLoaded(PEOPLE_SOURCE_ID)) return;
          if (!map.getSource(EVENTS_SOURCE_ID) || !map.isSourceLoaded(EVENTS_SOURCE_ID)) return;
        } catch {
          return;
        }
        updateMarkers();
      };
      map.on('moveend', reconcileMarkers);
      map.on('zoomend', reconcileMarkers);
      map.on('sourcedata', (e) => {
        if ((e.sourceId === PEOPLE_SOURCE_ID || e.sourceId === EVENTS_SOURCE_ID) && e.isSourceLoaded) {
          reconcileMarkers();
        }
      });

      map.on('zoom', () => {
        const scale = scaleForZoom(map.getZoom());
        for (const marker of markersRef.current.values()) {
          applyMarkerScale(marker.getElement(), scale);
        }
        declutterMarkers();
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

    // Spiderfy-style relaxation: iteratively pushes apart any two person
    // markers whose screen positions sit closer than one avatar diameter,
    // so people sharing (or nearly sharing) a coordinate — even members of
    // the same family — always render as separate, individually clickable
    // pins instead of overlapping or merging into a cluster blob. Runs in
    // screen space via marker.setOffset, so it never touches the underlying
    // geo coordinates and re-settles automatically whenever zoom changes
    // the effective avatar size.
    function declutterMarkers() {
      const scale = scaleForZoom(map.getZoom());
      const minDist = AVATAR_SIZE * scale + DECLUTTER_GAP;

      const entries: { id: string; marker: mapboxgl.Marker; base: mapboxgl.Point; offset: { x: number; y: number } }[] = [];
      for (const [id, marker] of markersRef.current) {
        if (!id.startsWith('person-')) continue;
        entries.push({ id, marker, base: map.project(marker.getLngLat()), offset: { x: 0, y: 0 } });
      }

      for (let iter = 0; iter < 6; iter++) {
        let moved = false;
        for (let i = 0; i < entries.length; i++) {
          for (let j = i + 1; j < entries.length; j++) {
            const a = entries[i];
            const b = entries[j];
            let dx = b.base.x + b.offset.x - (a.base.x + a.offset.x);
            let dy = b.base.y + b.offset.y - (a.base.y + a.offset.y);
            let dist = Math.hypot(dx, dy);
            if (dist >= minDist) continue;
            moved = true;
            if (dist < 0.001) {
              const angle = (hashPair(a.id, b.id) % 360) * (Math.PI / 180);
              dx = Math.cos(angle);
              dy = Math.sin(angle);
              dist = 1;
            }
            const push = (minDist - dist) / 2;
            const nx = (dx / dist) * push;
            const ny = (dy / dist) * push;
            a.offset.x -= nx;
            a.offset.y -= ny;
            b.offset.x += nx;
            b.offset.y += ny;
          }
        }
        if (!moved) break;
      }

      for (const { marker, offset } of entries) {
        marker.setOffset([offset.x, offset.y]);
      }
    }

    function upsertPersonMarker(props: PersonProperties, coords: [number, number], seen: Set<string>) {
      const id = `person-${props.personId}`;
      if (seen.has(id)) return;
      seen.add(id);

      const existing = markersRef.current.get(id);
      if (existing) {
        existing.setLngLat(coords);
        return;
      }
      const el = createPersonMarkerElement(
        { id: props.personId, firstName: props.firstName, photo: props.photo } as Person,
        (personId) => onSelectPersonRef.current(personId)
      );
      const marker = new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map);
      applyMarkerScale(el, scaleForZoom(map.getZoom()));
      markersRef.current.set(id, marker);
    }

    // One reconciler for every marker kind. Switching People/Events just
    // produces a different `seen` set below — the same "remove anything not
    // in seen" loop at the end tears down whichever layer isn't current, so
    // there's exactly one teardown path for every marker prefix
    // (person-, cluster-, event-, ecluster-, city-).
    function updateMarkers() {
      const seen = new Set<string>();

      if (modeRef.current === 'people') {
        updatePeopleMarkers(seen);
      } else {
        updateEventMarkers(seen);
      }

      for (const [id, marker] of markersRef.current) {
        if (!seen.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      }

      if (modeRef.current === 'people') declutterMarkers();
    }
    updateMarkersRef.current = updateMarkers;

    function updatePeopleMarkers(seen: Set<string>) {
      const source = map.getSource(PEOPLE_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
      if (!source) return;

      if (map.getZoom() >= EXPAND_ZOOM_THRESHOLD) {
        // Close enough in that nobody should hide behind a group icon —
        // render every visible adult as their own marker straight from the
        // source data, ignoring whatever Mapbox's clustering thinks at this
        // zoom. declutterMarkers() keeps them from overlapping.
        for (const feature of toPersonFeatureCollection(visibleAdultsRef.current).features) {
          const coords = feature.geometry.coordinates as [number, number];
          upsertPersonMarker(feature.properties, coords, seen);
        }
        return;
      }

      const features = map.querySourceFeatures(PEOPLE_SOURCE_ID);

      for (const feature of features) {
        const coords = (feature.geometry as Point).coordinates as [number, number];
        const props = feature.properties as
          | (PersonProperties & { cluster?: boolean; cluster_id?: number; point_count?: number })
          | null;
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
                map.easeTo({ center: coords, zoom: Math.max(zoom, EXPAND_ZOOM_THRESHOLD) });
              });
            });
            const marker = new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map);
            applyMarkerScale(el, scaleForZoom(map.getZoom()));
            markersRef.current.set(id, marker);
          });
        } else {
          upsertPersonMarker(props, coords, seen);
        }
      }
    }

    function updateEventMarkers(seen: Set<string>) {
      const tier = tierForZoom(map.getZoom());

      if (tier === 'country') {
        updateCityBubbles(seen);
        return;
      }

      const source = map.getSource(EVENTS_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
      if (!source) return;

      const features = map.querySourceFeatures(EVENTS_SOURCE_ID);
      const eventById = new Map(visibleEventsRef.current.map((e) => [e.id, e]));

      // Cap the live pulse to the 5 pins nearest the viewport center —
      // decided here, from the actual set of individual pins about to
      // render, rather than baked into the marker factory.
      const center = map.getCenter();
      const liveSet = new Set(
        features
          .filter((f) => {
            const props = f.properties as (EventProperties & { cluster?: boolean }) | null;
            if (!props || props.cluster) return false;
            const evt = eventById.get(props.eventId);
            return evt ? isLiveNow(evt) : false;
          })
          .map((f) => ({
            id: (f.properties as EventProperties).eventId,
            coords: (f.geometry as Point).coordinates as [number, number],
          }))
          .sort((a, b) => distanceSq(center, a.coords) - distanceSq(center, b.coords))
          .slice(0, MAX_LIVE_PULSES)
          .map((c) => c.id)
      );

      for (const feature of features) {
        const coords = (feature.geometry as Point).coordinates as [number, number];
        const props = feature.properties as
          | (EventProperties & { cluster?: boolean; cluster_id?: number; point_count?: number })
          | null;
        if (!props) continue;

        if (props.cluster) {
          const clusterId = props.cluster_id!;
          const id = `ecluster-${clusterId}`;
          if (seen.has(id)) continue;
          seen.add(id);

          const existing = markersRef.current.get(id);
          if (existing) {
            existing.setLngLat(coords);
            continue;
          }
          if (pendingRef.current.has(id)) continue;
          pendingRef.current.add(id);

          const sampleLimit = Math.min(props.point_count ?? CATEGORY_SAMPLE_LIMIT, CATEGORY_SAMPLE_LIMIT);
          source.getClusterLeaves(clusterId, sampleLimit, 0, (err, leaves) => {
            pendingRef.current.delete(id);
            if (err || !leaves || markersRef.current.has(id)) return;
            const counts = new Map<EventCategory, number>();
            for (const leaf of leaves) {
              const cat = (leaf.properties as EventProperties).category;
              counts.set(cat, (counts.get(cat) ?? 0) + 1);
            }
            let dominant: EventCategory = 'community';
            let best = -1;
            for (const [cat, count] of counts) {
              if (count > best) {
                best = count;
                dominant = cat;
              }
            }
            const el = createEventClusterMarkerElement(dominant, props.point_count ?? leaves.length, () => {
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
          const eventId = props.eventId;
          const id = `event-${eventId}`;
          if (seen.has(id)) continue;
          seen.add(id);

          const evt = eventById.get(eventId);
          if (!evt) continue;
          const live = liveSet.has(eventId);

          const existing = markersRef.current.get(id);
          if (existing) {
            existing.setLngLat(coords);
            const currentlyLive = Boolean(
              existing.getElement().querySelector('.event-marker__tile--live')
            );
            if (currentlyLive !== live) {
              // Live status (or the nearest-5 cap) changed — rebuild this
              // one marker's element rather than adding a second update
              // path for an in-place class toggle.
              existing.remove();
              const el = createEventMarkerElement(evt, live, (id2) => onSelectEventRef.current(id2));
              const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
                .setLngLat(coords)
                .addTo(map);
              applyMarkerScale(el, scaleForZoom(map.getZoom()));
              markersRef.current.set(id, marker);
            }
            continue;
          }

          const el = createEventMarkerElement(evt, live, (id2) => onSelectEventRef.current(id2));
          const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat(coords).addTo(map);
          applyMarkerScale(el, scaleForZoom(map.getZoom()));
          markersRef.current.set(id, marker);
        }
      }
    }

    function updateCityBubbles(seen: Set<string>) {
      const counts = new Map<string, number>();
      for (const evt of visibleEventsRef.current) {
        counts.set(evt.city, (counts.get(evt.city) ?? 0) + 1);
      }

      for (const city of ROMANIA_CITIES) {
        const count = counts.get(city.label) ?? 0;
        if (count === 0) continue;

        const id = `city-${city.id}`;
        seen.add(id);
        const coords: [number, number] = [city.lng, city.lat];

        const existing = markersRef.current.get(id);
        if (existing) {
          existing.setLngLat(coords);
          continue;
        }

        const el = createCityBubbleElement(city, count, () => {
          map.flyTo({ center: coords, zoom: 12 });
        });
        const marker = new mapboxgl.Marker({ element: el, anchor: 'top' }).setLngLat(coords).addTo(map);
        applyMarkerScale(el, scaleForZoom(map.getZoom()));
        markersRef.current.set(id, marker);
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
    const source = map.getSource(PEOPLE_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(toPersonFeatureCollection(visibleAdults));
  }, [visibleAdults]);

  // Push updated events into the source whenever the filtered list changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource(EVENTS_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(toEventFeatureCollection(visibleEvents));
  }, [visibleEvents]);

  // Switching mode doesn't touch either source's data, so it won't fire a
  // 'sourcedata' event on its own — reconcile explicitly. updateMarkers()
  // itself is what produces a different `seen` set per mode and tears down
  // the other layer; this effect only re-triggers that same reconciler.
  useEffect(() => {
    updateMarkersRef.current();
  }, [mode]);

  return (
    <div className="map-view">
      <div ref={containerRef} className="map-view__map" />
      <MapModeSwitch mode={mode} onModeChange={onModeChange} />
      {mode === 'events' && (
        <TimeFilter bucket={timeBucket} onBucketChange={setTimeBucket} counts={timeBucketCounts} />
      )}
    </div>
  );
}
