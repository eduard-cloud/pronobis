export const INVITE_CODE = 'pronobis';
export const GATE_STORAGE_KEY = 'pronobis.gate';

// The custom style is built on Mapbox's "Standard" 3D basemap, which only
// renders through the GL JS vector engine — the raster Tiles API (what the
// previous Leaflet-based map used) always returns a blank tile for it. The
// map now renders with mapbox-gl directly so this style works natively.
export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '';
export const MAPBOX_STYLE_URL = 'mapbox://styles/eduardbadea96/cmsa43f2100b101sdcputdr6h';

// The onboarding location picker still renders a small Leaflet map (not
// worth porting to GL JS for a decorative backdrop), which needs the
// classic raster Tiles API — the Standard-based custom style above only
// works through the GL JS vector engine, so this stays on the stock style.
export const MAPBOX_STOCK_TILE_URL = `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}{r}?access_token=${MAPBOX_ACCESS_TOKEN}`;
