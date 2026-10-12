# P01 — Routing verification gate

Status: BLOCKED until coordinates and route geometries are retrieved from authoritative sources.

Input links: see ../locations.json. The Google Maps short links have not been resolved in this session.

For each point, record: name, WGS84 longitude/latitude, source URL, verification date. For each route: origin, destination, travel mode, provider, retrieval timestamp, GeoJSON LineString, distanceMeters and durationSeconds (or null if unsupported), and attribution/license.

**Never invent** distances, times, coordinates, roads, or map imagery. Do not treat the route animation demo as geographic truth. The NeonRoute component accepts screen-space points only; real WGS84 coordinates must first be projected consistently onto a licensed basemap.

Gate: four validated routes + reviewed basemap projection and route alignment before factual preview/render.
