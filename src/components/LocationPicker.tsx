import L from 'leaflet';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { MAPBOX_TILE_URL } from '../config';
import './LocationPicker.css';

type LatLng = { lat: number; lng: number };

type Props = {
  value: LatLng;
  label: string;
  onChange: (value: LatLng) => void;
  onLabelChange: (label: string) => void;
};

const pinIcon = L.divIcon({
  html: '<div class="location-picker__pin"></div>',
  className: 'location-picker__pin-icon',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export function LocationPicker({ value, label, onChange, onLabelChange }: Props) {
  return (
    <div className="location-picker">
      <div className="location-picker__map-wrap">
        <MapContainer
          center={[value.lat, value.lng]}
          zoom={11}
          className="location-picker__map"
          zoomControl={false}
        >
          <TileLayer url={MAPBOX_TILE_URL} tileSize={256} detectRetina />
          <Marker
            position={[value.lat, value.lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const pos = (e.target as L.Marker).getLatLng();
                onChange({ lat: pos.lat, lng: pos.lng });
              },
            }}
          />
        </MapContainer>
        <p className="t-caption location-picker__hint">Drag the pin to your area</p>
      </div>
      <input
        className="onboarding__input t-body"
        type="text"
        placeholder="e.g. Cluj, Mărăști"
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
      />
    </div>
  );
}
