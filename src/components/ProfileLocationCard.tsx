import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { MAPBOX_STOCK_TILE_URL } from '../config';
import './ProfileLocationCard.css';

type Props = {
  location: { lat: number; lng: number; label: string };
};

const pinIcon = L.divIcon({
  html: '<div class="profile-location-card__pin"></div>',
  className: 'profile-location-card__pin-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

function RecenterButton({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  return (
    <button
      type="button"
      className="profile-location-card__recenter"
      aria-label="Recenter map"
      onClick={() => map.flyTo([lat, lng], map.getZoom(), { duration: 0.4 })}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2" fill="currentColor" />
        <path
          d="M8 1v2.5M8 12.5V15M1 8h2.5M12.5 8H15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

export function ProfileLocationCard({ location }: Props) {
  return (
    <div className="profile-location-card">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={12}
        className="profile-location-card__map"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer url={MAPBOX_STOCK_TILE_URL} tileSize={256} detectRetina />
        <Marker position={[location.lat, location.lng]} icon={pinIcon} />
        <RecenterButton lat={location.lat} lng={location.lng} />
      </MapContainer>
    </div>
  );
}
