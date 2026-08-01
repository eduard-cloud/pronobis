# ProNobis People — Phase 0 prototype

A lightweight people directory for ProNobis: put a face to a name, see who has
family in the community, and discover who lives near who.

This is a **clickable, testable prototype** to proof the concept with real
users — not production software.

## Important: the invite code is a door, not a lock

The gate screen checks the invite code entirely client-side, against a
constant in [`src/config.ts`](src/config.ts). Anyone who opens the app in dev
tools can read the code, and anyone with the code can edit anyone else's
profile. This is intentional for a Phase 0 proof session — it keeps casual
passersby out, nothing more. Do not treat it as authentication.

## Data

Everything lives in the browser: seeded mock people (`src/data/seed.ts`) plus
whatever testers add through onboarding, persisted to `localStorage` under
the key `pronobis.v1`. There is no backend and no server-side validation.
"Reset demo data" (in the avatar menu) wipes local changes and restores the
seed set — use it between testers.

## Running it

```bash
npm install
npm run dev -- --host
```

Open the printed LAN URL on an actual phone to test the segmented control,
sheet drag, and map bunch tap targets with a thumb — that's the point of this
build.

## Map tiles

The map uses Mapbox raster tiles (`src/config.ts`, `MAPBOX_TILE_URL`),
currently pointed at the stock `light-v11` style. The original custom style
(`eduardbadea96/cmsa43f2100b101sdcputdr6h`) returns blank tiles because it's
built on the new "Mapbox Standard" 3D basemap, which the raster Tiles API
(what Leaflet needs) doesn't render server-side. To use the custom style,
duplicate it in Mapbox Studio with a classic basemap import (not Standard),
publish it, and swap `MAPBOX_STYLE_ID` back.

## Out of scope

No backend, no real accounts, no photo moderation, no search-by-interest, no
admin. Anyone with the invite code can edit anyone's profile. This build
exists to answer "do people understand and want this?" — not to ship to the
whole company.
