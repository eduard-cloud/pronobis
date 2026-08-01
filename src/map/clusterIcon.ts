import L from 'leaflet';
import 'leaflet.markercluster';
import type { Person } from '../types';

const PEEK_COUNT = 2;
const AVATAR_SIZE = 34;
const OVERLAP = 22;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Renders a cluster the way Snapchat's map does: a peek of up to two real
 * avatar photos, overlapped, plus a "+N" badge for everyone else in the
 * cluster. Pulls real people (not just a count) from `clusterMembers`,
 * attached to each underlying household marker in FamilyBunchMarker. */
export function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const markers = cluster.getAllChildMarkers();
  const people = markers.flatMap(
    (m) => (m.options as { clusterMembers?: Person[] }).clusterMembers ?? []
  );
  const total = people.length || markers.length;

  const peek = people.slice(0, PEEK_COUNT);
  const overflow = total - peek.length;

  const slots = peek.length || 1;
  const width = AVATAR_SIZE + (slots - 1) * OVERLAP + (overflow > 0 ? OVERLAP : 0);

  const avatarsHtml = peek
    .map(
      (p, i) => `<img
        src="${p.photo}"
        alt="${escapeHtml(p.firstName)}"
        class="map-cluster__avatar"
        style="width:${AVATAR_SIZE}px;height:${AVATAR_SIZE}px;left:${i * OVERLAP}px;z-index:${10 - i};"
      />`
    )
    .join('');

  const badgeHtml =
    overflow > 0
      ? `<div class="map-cluster__badge" style="width:${AVATAR_SIZE}px;height:${AVATAR_SIZE}px;left:${peek.length * OVERLAP}px;z-index:${10 - peek.length};">+${overflow}</div>`
      : '';

  const html = `<div class="map-cluster" style="width:${width}px;height:${AVATAR_SIZE}px;">${avatarsHtml}${badgeHtml}</div>`;

  return L.divIcon({
    html,
    className: 'map-cluster-icon',
    iconSize: [width, AVATAR_SIZE],
    iconAnchor: [width / 2, AVATAR_SIZE / 2],
  });
}
