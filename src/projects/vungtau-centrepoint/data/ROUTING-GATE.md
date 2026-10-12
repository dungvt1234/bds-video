# P01 routing gate — Vũng Tàu Centre Point

Five user-supplied coordinates are in `locations.json` in GeoJSON order [longitude, latitude]. They have **not** been independently verified.

## Acquire route candidates

Run from repository root in an environment with outbound HTTPS:

```bash
ROUTING_BASE_URL=https://router.project-osrm.org npm run routes:fetch
```

The public OSRM demo is illustrative, rate-limited, not an SLA, and should not be relied on for production. Prefer a routing service with terms permitting the intended video usage. The command requests **driving** routes and writes four provider-returned LineStrings with provider URL, retrieval timestamp, distance and duration to `routes.geojson`.

## Mandatory review before animation / export

1. Check all five supplied pins against their named places.
2. Inspect each route on a properly licensed, georeferenced basemap; check roads, access restrictions, one-way segments and endpoint snapping.
3. Record routing provider, retrieval time, map data/license attribution, and any known travel-time limitations.
4. Mark routes verified only after manual review; candidate data is not final.
5. Never infer drive time from straight-line distances or render invented road paths.
6. Do not publish/render final video before geometry, basemap and licenses are verified.

**Current state:** candidate route acquisition was not executed successfully in this environment because the external routing hostname could not be resolved. `routes.geojson` remains empty; no actual distances or times are asserted.
