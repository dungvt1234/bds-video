# Centre Point Cinematic Future V8 — continuous camera

## V8 change

35 seconds / 1050 frames / 30 fps / 1080x1920. Uses the same real OSM roads, coastline, and building outlines as V7. Preserves the four user-provided geographic landmark pins and existing map provenance.

The **camera** flows continuously through the following locations:

| Seconds | Camera target |
| --- | --- |
| 0–4.4 | Centre Point activation |
| 4.4–10.67 | Centre Point local amenity orbit |
| 10.67–14.33 | Centre Point → Lotte Mart |
| 14.33–18.0 | Lotte Mart → Vũng Tàu Hospital |
| 18.0–21.67 | Hospital → Tháp Tam Thắng |
| 21.67–25.33 | Tháp Tam Thắng → Bãi Trước |
| 25.33–30.5 | Bãi Trước → whole-city view |
| 30.5–35.0 | Whole-city view → Centre Point outro |

The camera target, zoom, frame offset and roll have identical **end/start values at every shot join**, thus there is no sudden relocation to Centre Point and no artificial screen reset. Camera easing recomputes animation at every frame. Inter-amenity camera travel is cinematic, **not a represented drivable route**.

The original OSRM route candidates from Centre Point to each destination remain independent connection lines; a **new fictional travel route between venues is never asserted or drawn**.

## Files

- `CentrePointCinematicFutureV8.tsx` — Remotion 35s continuous camera + clean geolocated map base. No audio track.
- `data/v8-camera.json` — machine-readable camera trajectory and join constraints.
- `.github/workflows/centrepoint-v8-continuous.yml` — TypeScript validation, camera join assertions, render and preview artifact.
- The final reviewed video composites the user's **four image files**, displayed as **small luminous floating billboards anchored to map pins**. Image files are intentionally **not stored in the repository**, to avoid uploading user-provided photographs without additional permission. The downloadable editing pack includes four already-framed image assets and `centrepoint-v8-composite.py` to repeat this composition locally.

## Constraints before commercial publishing

All pin coordinates are user-provided and **not independently verified**. Original OSRM route candidates need review. Market, school, and Chí Linh beach in the initial amenity HUD do not yet have individually verified geolocated POIs. OSM attribution should remain visible. Check photo usage rights.

Feature branch only: `feat/centrepoint-map-motion`. No merge to main or deployment.
