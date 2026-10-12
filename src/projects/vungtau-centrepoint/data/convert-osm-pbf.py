#!/usr/bin/env python3
"""Convert a locally obtained OSM .pbf extract to the project's GeoJSON basemap.

Install: python -m pip install osmium
Run: python src/projects/vungtau-centrepoint/data/convert-osm-pbf.py PATH_TO_EXTRACT.osm.pbf
The input must come from a source whose license/attribution you have checked.
"""
import argparse
import datetime
import json
from pathlib import Path

try:
    import osmium
except ImportError as exc:
    raise SystemExit("Missing pyosmium: run python -m pip install osmium") from exc

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
loc = json.loads((PROJECT / "locations.json").read_text(encoding="utf-8"))
routes = json.loads((PROJECT / "routes.geojson").read_text(encoding="utf-8"))
if len(routes.get("features", [])) != 4:
    raise SystemExit("Expected four existing OSRM routes; refusing to generate basemap")

points = [loc["origin"]["coordinates"]]
points.extend(d["coordinates"] for d in loc["destinations"])
for feature in routes["features"]:
    points.extend(feature["geometry"]["coordinates"])

west = min(p[0] for p in points) - .009
east = max(p[0] for p in points) + .009
south = min(p[1] for p in points) - .009
north = max(p[1] for p in points) + .009

class BasemapHandler(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.features = []
        self.roads = 0
        self.coasts = 0

    def way(self, w):
        tags = w.tags
        is_coast = tags.get("natural") == "coastline"
        highway = tags.get("highway")
        if not highway and not is_coast:
            return
        coords = []
        try:
            for n in w.nodes:
                if not n.location.valid():
                    return
                coords.append([round(n.lon, 7), round(n.lat, 7)])
        except (ValueError, RuntimeError):
            return
        if len(coords) < 2:
            return
        # Retain entire OSM ways intersecting the area by vertex, avoiding
        # invented clipping segments. Some edge-crossing ways may be missed.
        if not any(west <= x <= east and south <= y <= north for x, y in coords):
            return
        self.features.append({
            "type": "Feature",
            "properties": {
                "osmId": int(w.id),
                "kind": "coastline" if is_coast else "road",
                "highway": str(highway) if highway else None,
                "name": str(tags.get("name")) if tags.get("name") else None
            },
            "geometry": {"type": "LineString", "coordinates": coords}
        })
        if is_coast:
            self.coasts += 1
        else:
            self.roads += 1

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("pbf", type=Path, help="Existing locally downloaded .osm.pbf extract")
parser.add_argument("--source-url", required=True, help="Actual URL where this extract was obtained")
args = parser.parse_args()
if not args.pbf.is_file():
    raise SystemExit(f"PBF file not found: {args.pbf}")
if not args.pbf.name.endswith(".osm.pbf"):
    raise SystemExit("Expected an .osm.pbf file")
if not args.source_url.startswith("https://"):
    raise SystemExit("Provide the actual HTTPS source URL for provenance")

handler = BasemapHandler()
handler.apply_file(str(args.pbf), locations=True)
if handler.roads < 20:
    raise SystemExit(f"Only {handler.roads} road features found; refusing to overwrite basemap")
out = {
    "type": "FeatureCollection",
    "features": handler.features,
    "metadata": {
        "source": "© OpenStreetMap contributors",
        "license": "ODbL 1.0",
        "attribution": "© OpenStreetMap contributors",
        "extractSourceUrl": args.source_url,
        "inputFileName": args.pbf.name,
        "retrievedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "bbox": [south, west, north, east],
        "roadCount": handler.roads,
        "coastlineCount": handler.coasts,
        "status": "CANDIDATE_REQUIRES_VISUAL_REVIEW",
        "limitations": "Ways selected by in-bounds vertices; coastline may be incomplete; no fabricated geometry."
    }
}
dest = PROJECT / "basemap.geojson"
dest.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
print(f"Saved {handler.roads} roads and {handler.coasts} coastline ways to {dest}")
print("Visual review and license check required; NOT VERIFIED.")
