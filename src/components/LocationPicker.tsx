import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
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

type AddressSuggestion = { label: string; lat: number; lng: number };

function RecenterOnChange({ lat, lng }: LatLng) {
  const map = useMap();
  useEffect(() => {
    const current = map.getCenter();
    if (Math.abs(current.lat - lat) > 1e-6 || Math.abs(current.lng - lng) > 1e-6) {
      map.flyTo([lat, lng], map.getZoom(), { duration: 0.6 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);
  return null;
}

function MapInteractions({ onSettle }: { onSettle: (value: LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      map.flyTo(e.latlng, map.getZoom(), { duration: 0.4 });
    },
    moveend() {
      const center = map.getCenter();
      onSettle({ lat: center.lat, lng: center.lng });
    },
  });
  return null;
}

export function LocationPicker({ value, label, onChange, onLabelChange }: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSearch = useRef(false);

  function selectArea(area: (typeof TIMISOARA_AREAS)[number]) {
    onChange({ lat: area.lat, lng: area.lng });
    onLabelChange(area.label);
    setSuggestions([]);
    setSearchOpen(false);
  }

  function selectSuggestion(s: AddressSuggestion) {
    skipNextSearch.current = true;
    onChange({ lat: s.lat, lng: s.lng });
    onLabelChange(s.label);
    setSuggestions([]);
    setSearchOpen(false);
  }

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const query = label.trim();
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          format: 'jsonv2',
          countrycodes: 'ro',
          'accept-language': 'ro',
          addressdetails: '1',
          limit: '5',
          q: query,
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
        const data: Array<{ lat: string; lon: string; display_name: string }> = await res.json();
        setSuggestions(
          data.map((item) => ({
            label: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }))
        );
      } catch {
        setSuggestions([]);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [label]);

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
          <MapInteractions onSettle={onChange} />
        </MapContainer>
        <div className="location-picker__center-pin" aria-hidden="true" />
        <p className="t-caption location-picker__hint">Tap or move the map to set your area</p>
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

      <div className="location-picker__search">
        <input
          className="onboarding__input t-body"
          type="text"
          placeholder="e.g. Cluj, Mărăști"
          value={label}
          onChange={(e) => {
            onLabelChange(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
        />
        {searchOpen && suggestions.length > 0 && (
          <ul className="location-picker__suggestions">
            {suggestions.map((s) => (
              <li key={`${s.lat},${s.lng}`}>
                <button type="button" onMouseDown={() => selectSuggestion(s)}>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
