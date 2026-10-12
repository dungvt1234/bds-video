# BDS Video — Vũng Tàu Centre Point

Remotion starter for **Storyboard V1.1**, style A (dark navy / neon green), vertical 1080×1920, 30fps, 30 seconds.

## Status

**PREVIEW SCAFFOLD ONLY. NOT A VERIFIED MAP VIDEO.** The repository was empty when initialized. The composition currently displays six placeholder title scenes. It does **not** draw roads, use map tiles, or assert distances/travel times. Do not publish this preview as a factual location advertisement.

## Commands

```bash
npm install
npm run studio
# Only after verified route data and production scenes are implemented:
npm run render:centrepoint
```

## Required before map animation

1. Resolve and verify origin + four destination coordinates against the supplied Google Maps links.
2. Obtain licensed dark basemap and routing geometry (GeoJSON), recording routing provider, travel mode, timestamp and attribution.
3. QA each route against real roads. Show distance and duration only if supported by verified provider output.
4. Replace placeholder scenes with map/camera/path animation and review in Studio.
5. Render only after approval.

## Scenes (900 frames)

0–149 project reveal; 150–299 Lotte Mart; 300–449 Vũng Tàu Hospital; 450–599 Tháp Tam Thắng; 600–749 Bãi Trước; 750–899 overview.

## Source map links

See `src/projects/vungtau-centrepoint/locations.json`. Geometry is intentionally empty in `routes.geojson`.
