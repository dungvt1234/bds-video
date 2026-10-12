# P03-B — Offline OpenStreetMap basemap acquisition

Overpass returned HTTP 429 on two public instances. Do **not** repeatedly retry them.

## Source and license

Obtain a regional `.osm.pbf` extract that includes Vũng Tàu from a reputable OpenStreetMap extract provider. One directory of extracts is [Geofabrik](https://download.geofabrik.de/asia/vietnam.html); inspect the provider's actual download URL and file size before downloading. A small local/custom regional extract is preferable to a full-country PBF. Do not rename an unrelated file to `.osm.pbf`.

OpenStreetMap data is provided under ODbL. Keep `© OpenStreetMap contributors` visibly attributed in previews and final media, and review extract-provider conditions. This workflow does not download files or claim verification.

## Windows PowerShell

From the repo root:

```powershell
git pull origin feat/centrepoint-map-motion
py -m pip install osmium
py src/projects/vungtau-centrepoint/data/convert-osm-pbf.py "C:\\path\\to\\your\\region.osm.pbf" --source-url "https://ACTUAL-DOWNLOAD-URL"
```

Replace both placeholders with the real local file path and the **actual** HTTPS source URL. Python 3 and enough memory/disk to stream the chosen extract are required. No Node install is needed for conversion.

Output: `src/projects/vungtau-centrepoint/basemap.geojson`. It contains OSM road and coastline ways in/near the extent of the five locations and four OSRM routes. The tool preserves real way geometry, does not generate artificial roads, and refuses to overwrite the output when fewer than 20 roads are found.

**Review gate:** inspect road alignment, coastline continuity, extent and styling against the routes. Ways are selected by vertices in the area; this may omit some boundary-crossing segments. If coastline count is zero or coastline geometry is incomplete, do not treat the coastal basemap as verified. Commit/push only after checking the output size and reviewing its provenance. Do not render/publish final video based solely on structural checks.
