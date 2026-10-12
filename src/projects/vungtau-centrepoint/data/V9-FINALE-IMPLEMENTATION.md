# Centre Point V9 — synchronized four-photo network finale

V9 is a 35-second **silent** vertical composition. Editing takes place on `feat/centrepoint-map-motion` only; no main merge or deployment.

## What changed from V8

- City routes persist after activation and do not fade when changing locations.
- Route colors: Lotte `#FFB563`, Hospital `#62E3B1`, Tháp Tam Thắng `#D09BFF`, Bãi Trước `#64DFFF`.
- Single continuous camera track, with the stable georeferenced overview held until frame 960.
- The four user-supplied photographs appear concurrently during frames **870–959** (29.0–32.0s), each on its original georeferenced marker with a small floating 3D perspective panel, a soft matching glow and a thin link to its actual marker. Since Lotte and Tháp Tam Thắng are near each other on the overview, the Lotte photo floats a little higher to avoid overlapping, while its actual marker remains at the supplied coordinate.
- The project title outro starts at frame 960 and ends at 1050 (32–35s).
- Removed redundant network HUD-card grid and busy large circular graphic.

## Implementation

- `CentrePointCinematicFutureV9.tsx` is the Remotion base composition.
- `data/v9-camera.json` keeps camera continuity, color palette and 29–32s timing.
- `.github/workflows/centrepoint-v9-four-photo-finale.yml` validates TypeScript, checks a continuous 35s camera, generates the real OSM map and renders silent MP4 + review stills.

Photos are not checked into GitHub. They are composited from user-provided files afterward using `centrepoint-v9-composite.py` and `assets/{lotte,hospital,tamthang,baitruoc}.png` supplied separately in the downloadable editing bundle.

CI render: https://github.com/dungvt1234/bds-video/actions/runs/38253538408 (**PASS**).

Review-gate limitations: Source OSM geometry is real but **the supplied destination pin coordinates and existing OSRM routes have not been independently validated**. Do not invent travel-time/distance claims; verify each before publishing advertising.
