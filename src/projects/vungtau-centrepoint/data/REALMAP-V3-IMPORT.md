# Centre Point V3 — authentic Vũng Tàu map acquisition and review

## Status (do not publish)
- `basemap.geojson` **already contains genuine OSM roads and coastline** imported in commit `e87648e58490` from the documented Geofabrik Vietnam source. QA rendered 3,839 road ways and 7 coastline ways. An earlier large-file API read returned an empty text field, which is not proof of an empty file. The old video is still not an accepted geographic render.
- Source of route candidates: pre-existing `routes.geojson` from OSRM. They are **not independently verified**.
- Five origin/destination coordinates: in `locations.json`, previously supplied by the project owner. Also **not independently verified**.
- Existing `buildings.geojson` / `future-footprints.json` contain partial authentic OSM building footprints; the full road/coastline data is a separate existing file.
- **Do not** render/finalize V3 or assert correct locations until imported map QA PNG is visually accepted.

## For additional named nearby amenities: obtain PBF extract
1. Open **https://extract.bbbike.org/** and select **Vũng Tàu**, Vietnam.
2. Set an extract extent containing the project and four destinations plus coastal context; for initial selection use approximately **west=107.045, east=107.157, south=10.310, north=10.432**. Inspect the rectangle visually against the OSM base displayed by BBBike, because the bounds here are intended for acquisition, not a verified municipal boundary.
3. Select **OSM PBF (.osm.pbf)**, request and download the extract from the URL BBBike actually supplies. BBBike may provide a link by email. Retain the original URL for provenance. Do not confuse an .osm XML download with a PBF extract.
4. The user can upload the actual **.osm.pbf file into the conversation** for conversion and map review. This project does not contain the extract yet.

The current basemap was sourced from the documented Geofabrik Vietnam PBF, not from BBBike. A new BBBike extract is OPTIONAL for base map roads, but a locally accessible PBF is still required to run the newly extended named-POI extractor for market, schools, and Chí Linh beach. Do not claim an amenity is absent when POIs have not been imported. This workflow deliberately does not scrape BBBike, invent an extract URL, or repeatedly retry blocked Overpass APIs.

## Local conversion and audited preview

In the checked-out `feat/centrepoint-map-motion` branch:

```powershell
py -m pip install osmium cairosvg
py src/projects/vungtau-centrepoint/data/convert-osm-pbf.py "C:\data\vungtau.osm.pbf" --source-url "https://REAL-EXTRACT-DOWNLOAD-URL"
py src/projects/vungtau-centrepoint/data/render-map-audit.py --output out/centrepoint-realmap-qa.png
```

Outputs:
- `src/projects/vungtau-centrepoint/basemap.geojson`: **actual OSM road + coastline ways**, no synthetic fill
- `src/projects/vungtau-centrepoint/poi-candidates.geojson`: **candidate** named school, marketplace, Chí Linh beach POIs with coordinates and per-item `CANDIDATE_REQUIRES_POI_REVIEW`
- `out/centrepoint-realmap-qa.svg`
- `out/centrepoint-realmap-qa.png`
- `out/centrepoint-realmap-qa.json` report with counts and limitations

The map uses a **single Web Mercator projection** for roads, coastline, routes, buildings and destination pins. Camera/HUD must use this same projection or be linked through corresponding Web Mercator world coordinates.

## Review and NO-GO gates

- At least 20 real road ways and at least one coastline way; otherwise fail closed.
- All four existing OSRM route geometry objects and all five geographic pin coordinates must have correct structure.
- Geographically compare the roads/coastline and five pins with OpenStreetMap; the user's map review is essential.
- Check that **Chí Linh beach**, market and school **name and physical positions** are genuine. No amenity is approved merely because it appeared in a PBF.
- Display an inner radar circle for style if desired, but its size is decorative unless explicitly calculated as a geographic radius. Do not arrange map pins evenly on a circle and imply those are their actual positions.
- Validate origin-to-route alignment and real road accessibility; do not invent travel times or distances.
- Keep OSM ODbL attribution and review source license requirements.
- Only after preview acceptance import audited GeoJSON into V3 video, overlay amenities/HUD and render 900-frame MP4.

The dedicated CI workflow `.github/workflows/centrepoint-realmap-audit.yml` **now renders QA PNG/SVG and evidence JSON** from the existing genuine basemap. A missing or invalid basemap is blocked, even if static Python checks pass. **CI success is not location verification.**

No merges or production deployment are authorized.
