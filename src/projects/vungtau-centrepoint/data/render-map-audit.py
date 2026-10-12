#!/usr/bin/env python3
"""Render a geographically aligned, attribution-correct Vung Tau map QA still.

This is a VERIFICATION preview, not a promotional render.
Input basemap MUST contain actual OSM roads and coastline; an empty source is a
hard error. Render geometry and all pins through one Web Mercator projection.
Dependencies for PNG: pip install cairosvg. SVG itself uses only Python stdlib.
"""
from __future__ import annotations
import argparse
import html
import json
import math
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent
RADIUS = 6378137.0
COLORS = {"lotte": "#C8FF76", "hospital": "#75DAED",
          "tamthang": "#F4CB83", "baitruoc": "#81D7EF"}
NAMES = {"lotte": "LOTTE MART", "hospital": "BỆNH VIỆN VŨNG TÀU",
         "tamthang": "THÁP TAM THẮNG", "baitruoc": "BÃI TRƯỚC"}

def load(path: Path):
    if not path.exists() or path.stat().st_size == 0:
        raise ValueError(f"MISSING_REAL_MAP_DATA: {path} (provide genuine OSM extract)")
    return json.loads(path.read_text(encoding="utf-8"))

def merc(p):
    lon, lat = p
    return (RADIUS * math.radians(lon),
            RADIUS * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))

def svgpath(points, proj, close=False):
    xy = [proj(p) for p in points if len(p) == 2]
    if len(xy) < 2:
        return ""
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in xy) + (" Z" if close else "")

def esc(s):
    return html.escape(str(s), quote=True)

def validation(basemap, locations, routes, poi):
    features = basemap.get("features", [])
    roads = [f for f in features if f.get("properties", {}).get("kind") == "road" and
             f.get("geometry", {}).get("type") == "LineString"]
    coasts = [f for f in features if f.get("properties", {}).get("kind") == "coastline" and
              f.get("geometry", {}).get("type") == "LineString"]
    route_features = routes.get("features", [])
    route_ids = {f.get("properties", {}).get("id") for f in route_features}
    wanted = {"lotte", "hospital", "tamthang", "baitruoc"}
    if len(roads) < 20:
        raise ValueError(f"NOT_VERIFIED: {len(roads)} OSM road ways (<20). Refusing simulated map.")
    if route_ids != wanted:
        raise ValueError("NOT_VERIFIED: missing/mismatched OSRM route IDs")
    if len(coasts) == 0:
        raise ValueError("NOT_VERIFIED: no coastline in extract. Need actual coastline for Vung Tau.")
    pts = [locations["origin"]["coordinates"]] + [p["coordinates"] for p in locations["destinations"]]
    if not all(isinstance(p, list) and len(p) == 2 and 106.9 < p[0] < 107.3 and 10.1 < p[1] < 10.6 for p in pts):
        raise ValueError("NOT_VERIFIED: location coordinates outside expected Vung Tau bounds")
    return roads, coasts, route_features

def run(args):
    locations = load(DATA / "locations.json")
    basemap = load(Path(args.basemap) if args.basemap else DATA / "basemap.geojson")
    routing = load(DATA / "routes.geojson")
    try:
        poi = load(DATA / "poi-candidates.geojson")
    except ValueError:
        poi = {"features": []}
    roads, coasts, routes = validation(basemap, locations, routing, poi)
    all_locations = [locations["origin"]["coordinates"]] + [p["coordinates"] for p in locations["destinations"]]
    all_locations += [p for r in routes for p in r["geometry"]["coordinates"]]
    west = min(p[0] for p in all_locations) - .013
    east = max(p[0] for p in all_locations) + .013
    south = min(p[1] for p in all_locations) - .013
    north = max(p[1] for p in all_locations) + .013
    X0, Y0, W, H = 36, 120, 1000, 900
    x0, y0 = merc([west, south])
    x1, y1 = merc([east, north])
    scale = min(W / (x1 - x0), H / (y1 - y0))
    pad_x = (W - (x1 - x0) * scale) / 2
    pad_y = (H - (y1 - y0) * scale) / 2
    def project(p):
        x, y = merc(p)
        return X0 + pad_x + (x-x0)*scale, Y0 + H-pad_y-(y-y0)*scale
    elements = [
       '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100" viewBox="0 0 1600 1100">',
       '<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#081C29"/><stop offset="1" stop-color="#031019"/></linearGradient>',
       '<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>',
       '<clipPath id="mapclip"><rect x="36" y="120" width="1000" height="900" rx="12"/></clipPath></defs>',
       '<rect width="1600" height="1100" fill="#04121C"/>',
       '<text x="42" y="60" fill="#F1F8F4" font-size="35" font-family="DejaVu Sans,Arial" font-weight="bold">VŨNG TÀU · CENTRE POINT</text>',
       '<text x="43" y="96" fill="#C8FF76" font-size="17" font-family="DejaVu Sans,Arial">REAL OSM MAP · GEOGRAPHIC QA · NOT AN ADVERTISEMENT</text>',
       '<rect x="36" y="120" width="1000" height="900" rx="12" fill="url(#bg)" stroke="#557784" stroke-width="2"/>',
       '<g clip-path="url(#mapclip)">'
    ]
    # Raw OSM footprint silhouettes only; no invented road or building heights.
    footprints_file = DATA / "future-footprints.json"
    building_count = 0
    if footprints_file.exists():
        shapes = load(footprints_file).get("polygons", [])
        for pts in shapes:
            coords = [p for p in pts if west <= p[0] <= east and south <= p[1] <= north]
            if len(coords) < 3:
                continue
            building_count += 1
            elements.append(f'<path d="{svgpath(pts,project,True)}" fill="#1A3743" stroke="#274E5D" stroke-width=".35"/>')
    for road in roads:
        hw = road["properties"].get("highway", "")
        major = hw in {"motorway","trunk","primary","secondary","tertiary"}
        w = "2.8" if major else "1.25"
        c = "#7290A1" if major else "#3B5967"
        d = svgpath(road["geometry"]["coordinates"], project)
        if d: elements.append(f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" opacity=".85" stroke-linecap="round"/>')
    for coast in coasts:
        d=svgpath(coast["geometry"]["coordinates"],project)
        if d: elements.append(f'<path d="{d}" fill="none" stroke="#58C3D5" stroke-width="4" opacity=".9"/>')
    for r in routes:
        rid = r["properties"]["id"]
        d=svgpath(r["geometry"]["coordinates"],project)
        col = COLORS[rid]
        elements.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="12" opacity=".27" filter="url(#glow)"/>')
        elements.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="3.5" stroke-linecap="round"/>')
    origin = locations["origin"]["coordinates"]
    cx, cy = project(origin)
    # Radar is purely decorative, not a geographic-radius claim.
    elements.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="62" stroke="#C8FF76" stroke-width="2" fill="none" stroke-dasharray="10 9" opacity=".65"/>')
    elements.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="30" stroke="#C8FF76" stroke-width="2" fill="#173C35"/>')
    elements.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="9" fill="#C8FF76"/>')
    elements.append(f'<text x="{cx+33:.1f}" y="{cy-28:.1f}" fill="#F8FFF0" font-family="DejaVu Sans,Arial" font-size="19" font-weight="bold" stroke="#06141D" stroke-width="4" paint-order="stroke">CENTRE POINT</text>')
    positions = {"centrepoint": origin}
    for i, dest in enumerate(locations["destinations"]):
        p = dest["coordinates"]; rid = dest["id"]
        positions[rid] = p
        px, py = project(p)
        c = COLORS[rid]
        elements.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="16" fill="#081D27" stroke="{c}" stroke-width="3"/>')
        elements.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="5" fill="{c}"/>')
        dx,dy=[(24,-23),(24,34),(-26,-25),(-26,35)][i]
        anchor = "start" if dx > 0 else "end"
        elements.append(f'<text x="{px+dx:.1f}" y="{py+dy:.1f}" text-anchor="{anchor}" font-size="17" font-family="DejaVu Sans,Arial" font-weight="bold" fill="{c}" stroke="#06141D" stroke-width="4" paint-order="stroke">{esc(NAMES[rid])}</text>')
    # POIs from OSM are candidates ONLY: plot distinct hollow icons, don't invent coordinates.
    candidate_counts = {"market":0,"school":0,"chi-linh-beach":0}
    for f in poi.get("features", []):
        p=f.get("geometry",{}).get("coordinates")
        props=f.get("properties",{})
        group=props.get("group")
        if group not in candidate_counts or not isinstance(p,list) or len(p)!=2:
            continue
        if not(west<=p[0]<=east and south<=p[1]<=north):continue
        candidate_counts[group]+=1
        if group != "chi-linh-beach" and candidate_counts[group]>3:continue
        x,y=project(p)
        elements.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="none" stroke="#EEC97A" stroke-width="2" stroke-dasharray="3 2"/>')
    elements.append('</g>')
    legend = [
      '<rect x="1062" y="120" width="500" height="900" fill="#09202B" rx="12" stroke="#45616B"/>',
      '<text x="1093" y="169" font-size="27" fill="#F1F8F4" font-family="DejaVu Sans,Arial" font-weight="bold">DATA AUDIT</text>',
      '<text x="1094" y="209" font-size="20" fill="#9AB1BB" font-family="DejaVu Sans,Arial">Actual georeferenced geometry</text>',
      '<path d="M1092 233h437" stroke="#385666"/>',
      f'<text x="1093" y="279" font-size="22" fill="#C8FF76" font-family="DejaVu Sans,Arial">OSM ROADS: {len(roads)}</text>',
      f'<text x="1093" y="315" font-size="22" fill="#72DCE5" font-family="DejaVu Sans,Arial">COASTLINE WAYS: {len(coasts)}</text>',
      f'<text x="1093" y="351" font-size="22" fill="#ADC1C8" font-family="DejaVu Sans,Arial">BUILDING FOOTPRINTS: {building_count}</text>',
      '<text x="1093" y="410" font-size="23" fill="#FFFFFF" font-family="DejaVu Sans,Arial" font-weight="bold">KẾT NỐI ĐÔ THỊ</text>',
    ]
    for i,rid in enumerate(["lotte","hospital","tamthang","baitruoc"]):
        yy=450+40*i
        legend.append(f'<circle cx="1106" cy="{yy-6}" r="8" fill="{COLORS[rid]}"/>')
        legend.append(f'<text x="1127" y="{yy}" font-size="19" fill="#D4E3E4" font-family="DejaVu Sans,Arial">{esc(NAMES[rid])}</text>')
    legend+= [
      '<text x="1093" y="660" font-size="22" fill="#FFFFFF" font-family="DejaVu Sans,Arial" font-weight="bold">TIỆN ÍCH GẦN / CANDIDATE</text>',
      f'<text x="1093" y="702" font-size="20" fill="#EEC97A" font-family="DejaVu Sans,Arial">Chợ: {candidate_counts["market"]} POI OSM</text>',
      f'<text x="1093" y="740" font-size="20" fill="#EEC97A" font-family="DejaVu Sans,Arial">Trường học: {candidate_counts["school"]} POI OSM</text>',
      f'<text x="1093" y="778" font-size="20" fill="#EEC97A" font-family="DejaVu Sans,Arial">Chí Linh: {candidate_counts["chi-linh-beach"]} POI OSM</text>',
      '<text x="1093" y="836" font-size="17" fill="#B7C4CB" font-family="DejaVu Sans,Arial">POIs require name/location review.</text>',
      '<text x="1093" y="865" font-size="17" fill="#B7C4CB" font-family="DejaVu Sans,Arial">OSRM routes and location pins</text>',
      '<text x="1093" y="890" font-size="17" fill="#B7C4CB" font-family="DejaVu Sans,Arial">not yet independently verified.</text>',
      '<text x="1093" y="952" font-size="18" fill="#F6DCA0" font-family="DejaVu Sans,Arial">STATUS: REQUIRES VISUAL REVIEW</text>',
      '<text x="43" y="1062" font-size="17" fill="#A8BFC4" font-family="DejaVu Sans,Arial">© OpenStreetMap contributors · ODbL 1.0 · No invented roads or POI locations · Radar ring decorative only</text>',
      '</svg>'
    ]
    elements.extend(legend)
    svg = "\n".join(elements) + "\n"
    out = Path(args.output)
    out.parent.mkdir(parents=True,exist_ok=True)
    out.with_suffix(".svg").write_text(svg,encoding="utf-8")
    try:
        import cairosvg
        cairosvg.svg2png(bytestring=svg.encode("utf-8"),write_to=str(out.with_suffix(".png")),output_width=1600,output_height=1100)
    except ImportError:
        print("PNG unavailable: pip install cairosvg (SVG was saved)")
    report = {"status":"CANDIDATE_REQUIRES_VISUAL_REVIEW","roadWays":len(roads),
              "coastlineWays":len(coasts),"buildingFootprints":building_count,
              "routes":len(routes),"poiCandidates":candidate_counts,
              "locationStatus":locations.get("status"),"basemapMetadata":basemap.get("metadata",{}),
              "warning":"Geographic locations, routes and POI names must be reviewed before promotional use."}
    out.with_suffix(".json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print(f"Map QA saved: {out.with_suffix('.svg')} and optional PNG")
    print(json.dumps({k:report[k] for k in ("roadWays","coastlineWays","routes","poiCandidates")},ensure_ascii=False))
if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--basemap",default=None,help="Real OSM GeoJSON basemap path")
    ap.add_argument("--output",default="out/centrepoint-realmap-qa.png")
    run(ap.parse_args())
