export const INVITE_CODE = 'pronobis';
export const GATE_STORAGE_KEY = 'pronobis.gate';

// TODO: swap back to username 'eduardbadea96' + style 'cmsa43f2100b101sdcputdr6h'
// once that Studio style has layers published — it currently returns blank
// tiles (verified via curl: 139 bytes vs ~99KB for a populated style).
const MAPBOX_USERNAME = 'mapbox';
const MAPBOX_STYLE_ID = 'light-v11';
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '';

export const MAPBOX_TILE_URL = `https://api.mapbox.com/styles/v1/${MAPBOX_USERNAME}/${MAPBOX_STYLE_ID}/tiles/256/{z}/{x}/{y}{r}?access_token=${MAPBOX_ACCESS_TOKEN}`;
