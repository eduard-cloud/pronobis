import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { MAPBOX_STOCK_TILE_URL } from '../config';
import { TIMISOARA_AREAS } from '../data/timisoaraAreas';
import { Chip } from './Chip';
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

function RecenterOnChange({ lat, lng }: LatLng) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);
  return null;
}

export function LocationPicker({ value, label, onChange, onLabelChange }: Props) {
  function selectArea(area: (typeof TIMISOARA_AREAS)[number]) {
    onChange({ lat: area.lat, lng: area.lng });
    onLabelChange(area.label);
  }

  return (
    <div className="location-picker">
      <div className="location-picker__map-wrap">
        <MapContainer
          center={[value.lat, value.lng]}
          zoom={12}
          className="location-picker__map"
          zoomControl={false}
        >
          <TileLayer url={MAPBOX_STOCK_TILE_URL} tileSize={256} detectRetina />
          <RecenterOnChange lat={value.lat} lng={value.lng} />
          <Marker
            position={[value.lat, value.lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e: L.LeafletEvent) => {
                const pos = (e.target as L.Marker).getLatLng();
                onChange({ lat: pos.lat, lng: pos.lng });
              },
            }}
          />
        </MapContainer>
        <p className="t-caption location-picker__hint">Drag the pin to your area</p>
      </div>

      <div className="location-picker__presets">
        {TIMISOARA_AREAS.map((area) => (
          <Chip
            key={area.label}
            variant="outline"
            selected={label === area.label}
            onClick={() => selectArea(area)}
          >
            {area.label}
          </Chip>
        ))}
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
