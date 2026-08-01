import L from 'leaflet';
import 'leaflet.markercluster';

/** Renders a cluster as a single count bubble in brand colors, summing the
 * adult headcount each underlying household marker carries (via
 * `memberCount`, attached in FamilyBunchMarker) rather than the raw marker
 * count, so the number reflects people, not households. */
export function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const markers = cluster.getAllChildMarkers();
  const count = markers.reduce((sum, m) => {
    const memberCount = (m.options as { memberCount?: number }).memberCount;
    return sum + (memberCount ?? 1);
  }, 0);

  const size = count < 10 ? 46 : count < 30 ? 54 : count < 100 ? 62 : 70;

  return L.divIcon({
    html: `<div class="map-cluster">${count}</div>`,
    className: 'map-cluster-icon',
    iconSize: [size, size],
  });
}
