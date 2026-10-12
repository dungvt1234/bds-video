#!/usr/bin/env python3
"""Extract OSM building footprints for a candidate 3D scene, without inventing heights.

Requires: py -m pip install osmium
Example (PowerShell):
  py src/projects/vungtau-centrepoint/data/extract-buildings.py "$env:USERPROFILE\\Downloads\\vungtau.osm.pbf" --source-url "https://download.geofabrik.de/asia/vietnam-latest.osm.pbf"

Uses OSM area assembly (closed ways and multipolygon relations). Writes only candidate
GeoJSON + audit summary; no render or claim of accurate building elevations.
"""
import argparse
import datetime as dt
import json
import re
from collections import Counter
from pathlib import Path

try:
    import osmium
except ImportError as exc:
    raise SystemExit("Install osmium: py -m pip install osmium") from exc

BASE = Path(__file__).resolve().parent.parent
locations = json.loads((BASE / "locations.json").read_text(encoding="utf-8"))
routes = json.loads((BASE / "routes.geojson").read_text(encoding="utf-8"))
points = [locations["origin"]["coordinates"]]
points += [p["coordinates"] for p in locations["destinations"]]
points += [xy for f in routes["features"] for xy in f["geometry"]["coordinates"]]
west = min(p[0] for p in points) - 0.009
east = max(p[0] for p in points) + 0.009
south = min(p[1] for p in points) - 0.009
north = max(p[1] for p in points) + 0.009

def vertices(coords):
    if not isinstance(coords, list):
        return
    if len(coords) >= 2 and isinstance(coords[0], (int, float)):
        yield coords
    else:
        for part in coords:
            yield from vertices(part)

def metres(value):
    if value is None:
        return None
    raw = str(value).strip().lower()
    # Only explicit metres (or bare numeric metres per OSM convention).
    m = re.fullmatch(r"(\\d+(?:\\.\\d+)?)\\s*(?:m|metres?|meters?)?", raw)
    if not m:
        return None
    v = float(m.group(1))
    return v if 0 < v <= 1000 else None

class Buildings(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.factory = osmium.geom.GeoJSONFactory()
        self.features = []
        self.counts = Counter()
        self.invalid = 0

    def area(self, a):
        tags = a.tags
        if not tags.get("building") or tags.get("building") == "no":
            return
        try:
            geometry = json.loads(self.factory.create_multipolygon(a))
            pts = list(vertices(geometry["coordinates"]))
        except (ValueError, RuntimeError, KeyError, TypeError):
            self.invalid += 1
            return
        if not pts or not any(west <= p[0] <= east and south <= p[1] <= north for p in pts):
            return
        height_raw = tags.get("height")
        height = metres(height_raw)
        levels_raw = tags.get("building:levels")
        levels = None
        if levels_raw and re.fullmatch(r"\\d+(?:\\.\\d+)?", str(levels_raw).strip()):
            v = float(levels_raw)
            if 0 < v <= 300:
                levels = v
        status = "EXPLICIT_HEIGHT" if height is not None else ("LEVELS_ONLY" if levels is not None else "NO_HEIGHT")
        self.counts[status] += 1
        self.features.append({
            "type": "Feature",
            "properties": {
                "osmAreaId": str(a.id),
                "building": str(tags.get("building")),
                "heightMeters": height,
                "heightRaw": str(height_raw) if height_raw else None,
                "buildingLevels": levels,
                "heightStatus": status,
                "note": "LEVELS_ONLY is not a measured height; do not present illustrative extrusion as factual."
            },
            "geometry": geometry
        })

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("pbf", type=Path)
parser.add_argument("--source-url", required=True)
args = parser.parse_args()
if not args.pbf.is_file():
    raise SystemExit(f"PBF file not found: {args.pbf}")
if not args.source_url.startswith("https://"):
    raise SystemExit("HTTPS source URL required")
handler = Buildings()
handler.apply_file(str(args.pbf), locations=True)
if not handler.features:
    raise SystemExit("No building polygons found; not overwriting output")
timestamp = dt.datetime.now(dt.timezone.utc).isoformat()
metadata = {
    "attribution": "© OpenStreetMap contributors", "license": "ODbL 1.0",
    "sourceUrl": args.source_url, "inputFile": args.pbf.name,
    "retrievedAt": timestamp, "bboxLonLat": [west, south, east, north],
    "status": "CANDIDATE_NOT_VISUALLY_VERIFIED",
    "counts": dict(handler.counts), "invalidGeometryCount": handler.invalid,
    "limitations": "Area selection by in-bounds vertex; edge-crossing polygons may be missed. Missing heights are NOT inferred."
}
output = BASE / "buildings.geojson"
output.write_text(json.dumps({"type": "FeatureCollection", "features": handler.features, "metadata": metadata}, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
audit = BASE / "building-audit.json"
audit.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Buildings:", len(handler.features), "| explicit height:", handler.counts["EXPLICIT_HEIGHT"], "| levels only:", handler.counts["LEVELS_ONLY"], "| no height:", handler.counts["NO_HEIGHT"], "| invalid:", handler.invalid)
print("Saved:", output, "and", audit)
print("CANDIDATE / NOT VERIFIED. No 3D geometry or video rendered.")
